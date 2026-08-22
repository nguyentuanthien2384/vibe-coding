import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { CartResponse, CartItemResponse } from './interfaces/cart.interface';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy hoặc tạo Giỏ hàng chủ động dựa theo userId (nếu đã login) hoặc sessionId (nếu là Guest).
   * Tự động gộp giỏ hàng vãng lai trong DB vào tài khoản User nếu có sessionId truyền kèm.
   */
  async getOrCreateCart(userId?: number, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new BadRequestException(
        'Cần cung cấp thông tin phiên (Header X-Session-ID) hoặc Đăng nhập để sử dụng giỏ hàng',
      );
    }

    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.isActive) {
        throw new ForbiddenException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }

      let userCart = await this.prisma.cart.findUnique({
        where: { userId },

        include: {
          items: {
            include: { product: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!userCart) {
        userCart = await this.prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: { product: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }

      // Tự động gộp Giỏ hàng Guest trong DB vào User Cart nếu có sessionId
      if (sessionId) {
        const guestCart = await this.prisma.cart.findUnique({
          where: { sessionId },
          include: { items: true },
        });

        if (guestCart && guestCart.id !== userCart.id && guestCart.items.length > 0) {
          for (const guestItem of guestCart.items) {
            const existingUserItem = await this.prisma.cartItem.findFirst({
              where: {
                cartId: userCart.id,
                productId: guestItem.productId,
              },
            });

            const product = await this.prisma.product.findUnique({
              where: { id: guestItem.productId },
            });

            if (product && product.isActive) {
              let targetQty = existingUserItem
                ? existingUserItem.quantity + guestItem.quantity
                : guestItem.quantity;

              if (targetQty > product.stock) {
                targetQty = product.stock;
              }

              if (existingUserItem) {
                await this.prisma.cartItem.update({
                  where: { id: existingUserItem.id },
                  data: { quantity: targetQty },
                });
              } else {
                await this.prisma.cartItem.create({
                  data: {
                    cartId: userCart.id,
                    productId: guestItem.productId,
                    quantity: targetQty,
                  },
                });
              }
            }
          }

          // Xóa giỏ hàng Guest cũ sau khi đã gộp thành công vào User Cart
          await this.prisma.cart.delete({
            where: { id: guestCart.id },
          }).catch(() => null);

          // Lấy lại User Cart hoàn chỉnh đã gộp dữ liệu mới
          userCart = (await this.prisma.cart.findUnique({
            where: { userId },
            include: {
              items: {
                include: { product: true },
                orderBy: { createdAt: 'desc' },
              },
            },
          })) || userCart;
        }
      }

      return userCart;
    }

    // Đối với Guest User chưa đăng nhập (dùng sessionId)
    let cart = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { sessionId },
        include: {
          items: {
            include: { product: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    return cart;
  }

  /**
   * Tính toán và cấu trúc lại dữ liệu phản hồi Giỏ hàng chuẩn
   */
  private formatCartResponse(cart: any): CartResponse {
    let subtotal = 0;
    let totalItems = 0;

    const items: CartItemResponse[] = (cart.items || []).map((item: any) => {
      const product = item.product;
      const price = Number(product.salePrice ?? product.price);
      const originalPrice = product.salePrice ? Number(product.price) : null;
      const itemTotal = price * item.quantity;
      const isAvailable = product.isActive && product.stock >= item.quantity;

      subtotal += itemTotal;
      totalItems += item.quantity;

      return {
        id: item.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrl,
        price,
        originalPrice,
        quantity: item.quantity,
        stock: product.stock,
        isAvailable,
        itemTotal,
      };
    });

    // Miễn phí giao hàng với đơn >= 200,000đ (hoặc đơn rỗng = 0đ), còn lại 30,000đ
    const shippingFee = subtotal >= 200000 || subtotal === 0 ? 0 : 30000;
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    return {
      cartId: cart.id,
      totalItems,
      subtotal,
      shippingFee,
      discount,
      total,
      items,
    };
  }

  /**
   * API 1: Lấy chi tiết giỏ hàng hiện tại
   */
  async getCart(userId?: number, sessionId?: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    return this.formatCartResponse(cart);
  }

  /**
   * API 2: Thêm sản phẩm vào giỏ hàng (Kiểm tra tồn kho & Stock Guard)
   */
  async addToCart(
    dto: AddToCartDto,
    userId?: number,
    sessionId?: string,
  ): Promise<CartResponse> {
    const { productId, quantity } = dto;

    // 1. Kiểm tra sự tồn tại và trạng thái sản phẩm
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Sản phẩm không tồn tại hoặc đã ngừng kinh doanh');
    }

    // 2. Lấy giỏ hàng hiện tại
    const cart = await this.getOrCreateCart(userId, sessionId);

    // 3. Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    // 4. Stock Guard Check
    if (product.stock < newQuantity) {
      throw new BadRequestException(
        `Số lượng yêu cầu (${newQuantity}) vượt quá tồn kho khả dụng (${product.stock}) của sản phẩm`,
      );
    }

    // 5. Cập nhật hoặc thêm mới sản phẩm vào giỏ
    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return this.getCart(userId, sessionId);
  }

  /**
   * API 3: Cập nhật số lượng của một dòng sản phẩm trong giỏ
   */
  async updateCartItem(
    cartItemId: number,
    dto: UpdateCartItemDto,
    userId?: number,
    sessionId?: string,
  ): Promise<CartResponse> {
    const { quantity } = dto;
    const currentCart = await this.getOrCreateCart(userId, sessionId);

    // 1. Tìm CartItem theo ID
    let cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true },
    });

    // 2. Kiểm tra nếu cartItem thuộc giỏ hàng hiện tại hoặc tìm theo productId
    if (!cartItem || cartItem.cartId !== currentCart.id) {
      let targetProductId = cartItem?.productId;

      // Nếu không có productId từ cartItem cũ, thử tìm item trong currentCart
      const validItem = await this.prisma.cartItem.findFirst({
        where: targetProductId
          ? { cartId: currentCart.id, productId: targetProductId }
          : { cartId: currentCart.id, id: cartItemId },
        include: { cart: true, product: true },
      });

      if (!validItem) {
        throw new NotFoundException('Dòng sản phẩm trong giỏ hàng không tồn tại');
      }

      cartItem = validItem;
    }

    // 3. Stock Guard Check
    if (cartItem.product.stock < quantity) {
      throw new BadRequestException(
        `Số lượng yêu cầu (${quantity}) vượt quá tồn kho khả dụng (${cartItem.product.stock}) của sản phẩm`,
      );
    }

    // 4. Cập nhật số lượng sản phẩm
    await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    return this.getCart(userId, sessionId);
  }

  /**
   * API 4: Xóa 1 sản phẩm khỏi giỏ hàng
   */
  async removeCartItem(
    cartItemId: number,
    userId?: number,
    sessionId?: string,
  ): Promise<CartResponse> {
    const currentCart = await this.getOrCreateCart(userId, sessionId);

    let cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    // Kiểm tra xem item có thuộc giỏ hàng hiện tại hay không
    if (cartItem && cartItem.cartId === currentCart.id) {
      await this.prisma.cartItem.delete({
        where: { id: cartItem.id },
      });
    } else {
      // Nếu ID không khớp trực tiếp (do mới sync/re-created), tìm theo productId thuộc currentCart
      const validItem = await this.prisma.cartItem.findFirst({
        where: cartItem
          ? { cartId: currentCart.id, productId: cartItem.productId }
          : { cartId: currentCart.id, id: cartItemId },
      });

      if (validItem) {
        await this.prisma.cartItem.delete({
          where: { id: validItem.id },
        });
      }
    }

    return this.getCart(userId, sessionId);
  }

  /**
   * API 5: Dọn dẹp toàn bộ giỏ hàng (Clear Cart)
   */
  async clearCart(userId?: number, sessionId?: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId, sessionId);
  }

  /**
   * API 6: Gộp giỏ hàng vãng lai (Guest) vào tài khoản User sau khi Đăng Nhập
   */
  async mergeCart(userId: number, dto: MergeCartDto): Promise<CartResponse> {
    const userCart = await this.getOrCreateCart(userId);

    for (const itemDto of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: itemDto.productId },
      });

      // Bỏ qua nếu sản phẩm không tồn tại hoặc đã ngừng kinh doanh
      if (!product || !product.isActive) {
        continue;
      }

      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: itemDto.productId,
        },
      });

      let targetQuantity = existingItem
        ? existingItem.quantity + itemDto.quantity
        : itemDto.quantity;

      // Clamp số lượng theo tồn kho khả dụng tối đa
      if (targetQuantity > product.stock) {
        targetQuantity = product.stock;
      }

      if (targetQuantity > 0) {
        if (existingItem) {
          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: targetQuantity },
          });
        } else {
          await this.prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: itemDto.productId,
              quantity: targetQuantity,
            },
          });
        }
      }
    }

    return this.getCart(userId);
  }

  /**
   * API 7: Đồng bộ giỏ hàng từ tài khoản User sang Guest Session khi người dùng bấm Đăng xuất
   */
  async syncGuestCart(userId: number, sessionId: string): Promise<CartResponse> {
    if (!sessionId) {
      throw new BadRequestException('Cần truyền header X-Session-ID để đồng bộ giỏ hàng Guest');
    }

    const userCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Lấy hoặc tạo Guest Cart cho sessionId
    let guestCart = await this.prisma.cart.findUnique({
      where: { sessionId },
    });

    if (!guestCart) {
      guestCart = await this.prisma.cart.create({
        data: { sessionId },
      });
    }

    // Nếu User Cart có sản phẩm -> Sao chép sang Guest Cart
    if (userCart && userCart.items.length > 0) {
      // Dọn dẹp items cũ của Guest Cart (nếu có)
      await this.prisma.cartItem.deleteMany({
        where: { cartId: guestCart.id },
      });

      // Copy từng sản phẩm từ User Cart sang Guest Cart
      for (const item of userCart.items) {
        if (item.product && item.product.isActive) {
          await this.prisma.cartItem.create({
            data: {
              cartId: guestCart.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
      }
    }

    return this.getCart(undefined, sessionId);
  }
}
