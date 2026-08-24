import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { OrderConfirmedEvent } from '../mail/events/mail.events';
import {
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  NotificationType,
  ShippingMethod,
} from '@prisma/client';
import { PointsService } from '../points/points.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly vouchersService: VouchersService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationsService: NotificationsService,
    private readonly pointsService: PointsService,
  ) {}

  /**
   * Khởi tạo Đơn hàng mới (Atomic Transaction & Stock reservation)
   */
  async createOrder(
    dto: CreateOrderDto,
    userId?: number,
    sessionId?: string,
  ) {
    if (!userId && !sessionId) {
      throw new BadRequestException('Thiếu thông tin người dùng hoặc phiên giỏ hàng');
    }

    // 0. Chặn hoàn toàn nếu tài khoản bị khóa
    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.isActive) {
        throw new ForbiddenException('Tài khoản của bạn đã bị khóa. Không thể thực hiện đặt hàng');
      }
    } else if (dto.customerInfo?.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.customerInfo.email.toLowerCase().trim() },
      });
      if (existingUser && !existingUser.isActive) {
        throw new ForbiddenException('Tài khoản với email này đã bị khóa. Vui lòng liên hệ quản trị viên');
      }
    }


    // 1. Lấy thông tin Giỏ hàng trong DB

    const cart = await this.prisma.cart.findFirst({
      where: userId
        ? {
            OR: [
              { userId },
              ...(sessionId ? [{ sessionId }] : []),
            ],
          }
        : { sessionId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng của bạn đang trống');
    }

    // 2. Tính Phí Vận Chuyển
    const standardFee = 30000;
    const expressFee = 50000;
    const shippingFee =
      dto.shippingMethod === ShippingMethod.EXPRESS ? expressFee : standardFee;

    // 3. Thực thi DB Transaction nguyên tử
    const result = await this.prisma.$transaction(async (tx) => {
      // Re-verify tồn kho & giá sản phẩm
      let subtotal = 0;
      const orderItemDataList: Array<{
        productId: number;
        productName: string;
        productImageUrl: string;
        price: number;
        originalPrice?: number;
        quantity: number;
        itemTotal: number;
      }> = [];

      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new BadRequestException(
            `Sản phẩm "${item.product.name}" hiện không còn kinh doanh`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm "${product.name}" chỉ còn ${product.stock} món trong kho`,
          );
        }

        const actualPrice = Number(product.salePrice ?? product.price);
        const lineTotal = actualPrice * item.quantity;
        subtotal += lineTotal;

        orderItemDataList.push({
          productId: product.id,
          productName: product.name,
          productImageUrl: product.imageUrl,
          price: actualPrice,
          originalPrice: Number(product.price),
          quantity: item.quantity,
          itemTotal: lineTotal,
        });
      }

      // Tối ưu Voucher
      let discountAmount = 0;
      let appliedVoucherCode: string | null = null;

      if (dto.voucherCode) {
        const voucherRes = await this.vouchersService.applyVoucher({
          code: dto.voucherCode,
          subtotal,
        });

        discountAmount = voucherRes.calculatedDiscount;
        appliedVoucherCode = voucherRes.voucherCode;

        // Cập nhật usedCount
        await tx.voucher.update({
          where: { code: appliedVoucherCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Sinh orderCode duy nhất
      let orderCode = `TB-${Math.floor(100000 + Math.random() * 900000)}`;
      let isCodeUnique = false;
      while (!isCodeUnique) {
        const existing = await tx.order.findUnique({ where: { orderCode } });
        if (!existing) {
          isCodeUnique = true;
        } else {
          orderCode = `TB-${Math.floor(100000 + Math.random() * 900000)}`;
        }
      }

      // Khấu trừ Điểm thưởng TechBite (nếu có)
      let pointsUsed = 0;
      let pointsDiscount = 0;
      const payableBeforePoints = Math.max(0, subtotal + shippingFee - discountAmount);

      if (dto.pointsToUse && dto.pointsToUse > 0) {
        if (!userId) {
          throw new UnauthorizedException('Vui lòng đăng nhập để sử dụng điểm tích lũy');
        }
        const pointsRes = await this.pointsService.redeemPointsForOrder(
          tx,
          userId,
          orderCode,
          dto.pointsToUse,
          payableBeforePoints,
        );
        pointsUsed = pointsRes.pointsUsed;
        pointsDiscount = pointsRes.pointsDiscount;
      }

      const totalAmount = Math.max(0, payableBeforePoints - pointsDiscount);
      const isZeroTotal = totalAmount === 0;

      // Tạo Đơn hàng
      const order = await tx.order.create({
        data: {
          orderCode,
          userId: userId || null,
          sessionId: sessionId || null,
          customerName: dto.customerInfo.fullName,
          customerEmail: dto.customerInfo.email,
          customerPhone: dto.customerInfo.phone,
          provinceName: dto.shippingAddress.provinceName,
          districtName: dto.shippingAddress.districtName,
          wardName: dto.shippingAddress.wardName,
          detailAddress: dto.shippingAddress.detailAddress,
          shippingMethod: dto.shippingMethod,
          shippingFee,
          subtotal,
          discountAmount,
          pointsUsed,
          pointsDiscount,
          totalAmount,
          voucherCode: appliedVoucherCode,
          orderNote: dto.orderNote || null,
          paymentMethod: isZeroTotal ? PaymentMethod.COD : dto.paymentMethod,
          paymentStatus: isZeroTotal ? PaymentStatus.PAID : PaymentStatus.PENDING,
          orderStatus: isZeroTotal ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
          paidAt: isZeroTotal ? new Date() : null,
          orderItems: {
            create: orderItemDataList.map((it) => ({
              productId: it.productId,
              productName: it.productName,
              productImageUrl: it.productImageUrl,
              price: it.price,
              originalPrice: it.originalPrice,
              quantity: it.quantity,
              itemTotal: it.itemTotal,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      // Trừ tồn kho sản phẩm
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Xóa các mục trong giỏ hàng
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    // 4. Nếu phương thức thanh toán là QR Code -> Tạo thông tin VietQR
    let qrInfo: any = null;
    if (result.paymentMethod === PaymentMethod.QR_CODE) {
      const qrUrl = `https://api.vietqr.io/image/970422-0987654321-compact2.png?amount=${Number(
        result.totalAmount,
      )}&addInfo=${result.orderCode}&accountName=TECHBITE%20STORE`;

      qrInfo = {
        qrCodeUrl: qrUrl,
        bankName: 'MBBank (Ngân hàng Quân Đội)',
        accountNo: '0987654321',
        accountName: 'CÔNG TY TNHH TECHBITE ECOMMERCE',
        amount: Number(result.totalAmount),
        transferContent: result.orderCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };

      // Đặt Redis key hết hạn 15 phút
      await this.redis.setEx(
        `order:qr_expire:${result.orderCode}`,
        900,
        'PENDING',
      );
    }

    this.eventEmitter.emit(
      'order.created',
      new OrderConfirmedEvent({
        userId: result.userId || undefined,
        email: result.customerEmail,
        customerName: result.customerName,
        orderCode: result.orderCode,
        totalAmount: Number(result.totalAmount),
        shippingFee: Number(result.shippingFee),
        discountAmount: Number(result.discountAmount),
        paymentMethod: result.paymentMethod,
        shippingAddress: `${result.detailAddress}, ${result.wardName}, ${result.districtName}, ${result.provinceName}`,
        items: result.orderItems.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
          itemTotal: Number(item.itemTotal),
        })),
        createdAt: result.createdAt,
      }),
    );

    // Phát thông báo Realtime tới Admin Dashboard
    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(result.totalAmount));

    void this.notificationsService.broadcastToAdmins({
      title: `Đơn hàng mới #${result.orderCode}`,
      content: `Khách hàng ${result.customerName} vừa đặt đơn hàng #${result.orderCode} (${formattedAmount}).`,
      type: NotificationType.NEW_ORDER,
      orderCode: result.orderCode,
      actionUrl: `/orders/${result.id}`,
    });

    return {
      orderId: result.id,
      orderCode: result.orderCode,
      totalAmount: Number(result.totalAmount),
      shippingFee: Number(result.shippingFee),
      discountAmount: Number(result.discountAmount),
      paymentMethod: result.paymentMethod,
      status: result.paymentStatus,
      qrInfo,
    };
  }

  /**
   * Polling kiểm tra trạng thái đơn hàng theo orderCode
   */
  async getOrderStatus(orderCode: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderCode },
      select: {
        id: true,
        orderCode: true,
        paymentStatus: true,
        orderStatus: true,
        paidAt: true,
        totalAmount: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy thông tin đơn hàng');
    }

    return {
      orderCode: order.orderCode,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paidAt: order.paidAt,
      totalAmount: Number(order.totalAmount),
    };
  }

  /**
   * Khách hàng hủy đơn hàng đang chờ xử lý (PENDING)
   * Tự động hoàn tồn kho và hoàn 100% điểm tích lũy đã dùng
   */
  async cancelOrder(orderCode: string, userId: number, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderCode },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên đơn hàng này');
    }

    if (order.orderStatus !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể hủy đơn hàng đang ở trạng thái Chờ xử lý (PENDING)',
      );
    }

    // Thực thi transaction hoàn kho và cập nhật CANCELLED
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason || 'Khách hàng tự hủy đơn',
        },
      });

      // Hoàn trả stock
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return updated;
    });

    // Tự động hoàn lại 100% điểm tích lũy nếu đơn có dùng điểm
    if (order.pointsUsed > 0) {
      void this.pointsService.refundPointsFromOrder(order.id);
    }

    return {
      success: true,
      message: 'Hủy đơn hàng thành công và đã hoàn lại điểm tích lũy (nếu có)',
      orderCode: updatedOrder.orderCode,
      orderStatus: updatedOrder.orderStatus,
    };
  }

  async confirmDemoPayment(orderCode: string) {
    const isLocked = await this.redis.get(`order:qr_confirm_lock:${orderCode}`);
    if (isLocked) {
      throw new BadRequestException(
        'Đang xử lý giao dịch cho đơn hàng này. Vui lòng chờ trong giây lát',
      );
    }

    const order = await this.prisma.order.findUnique({
      where: { orderCode },
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        totalAmount: true,
        paymentMethod: true,
        paymentStatus: true,
        orderStatus: true,
        paidAt: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy thông tin đơn hàng');
    }

    if (order.paymentMethod !== PaymentMethod.QR_CODE) {
      throw new BadRequestException('Chỉ đơn VietQR mới cần xác nhận thanh toán');
    }

    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(order.totalAmount));

    // Phát thông báo Realtime tới Admin Dashboard: Khách bấm "Đã chuyển khoản"
    void this.notificationsService.broadcastToAdmins({
      title: `Khách đã chuyển khoản #${order.orderCode}`,
      content: `Khách hàng ${order.customerName} đã bấm "Tôi đã chuyển khoản xong" cho đơn hàng #${order.orderCode} (${formattedAmount}).`,
      type: NotificationType.PAYMENT_SUBMITTED,
      orderCode: order.orderCode,
      actionUrl: `/orders/${order.id}`,
    });

    if (order.paymentStatus === PaymentStatus.PAID) {
      return order;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { orderCode },
      data: {
        paymentStatus: PaymentStatus.PAID,
        orderStatus: OrderStatus.CONFIRMED,
        paidAt: new Date(),
      },
      select: {
        orderCode: true,
        paymentStatus: true,
        orderStatus: true,
        paidAt: true,
      },
    });

    await this.redis.del(`order:qr_expire:${orderCode}`);
    return updatedOrder;
  }

  /**
   * Xử lý Webhook thanh toán từ ngân hàng (Idempotency với Redis)
   */
  async handlePaymentWebhook(dto: PaymentWebhookDto) {
    const redisKey = `webhook:processed:${dto.transactionId}`;
    const alreadyProcessed = await this.redis.get(redisKey);

    if (alreadyProcessed) {
      return { message: 'Giao dịch đã được xử lý trước đó', success: true };
    }

    // Parse mã đơn dạng TB-XXXXXX từ nội dung chuyển khoản
    const match = dto.transferContent.match(/TB-\d{6}/i);
    if (!match) {
      throw new BadRequestException(
        'Không tìm thấy mã đơn hàng TechBite trong nội dung chuyển khoản',
      );
    }

    const orderCode = match[0].toUpperCase();
    const order = await this.prisma.order.findUnique({
      where: { orderCode },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${orderCode}`);
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      await this.redis.setEx(redisKey, 86400, '1');
      return { message: 'Đơn hàng đã thanh toán trước đó', success: true };
    }

    // Cập nhật trạng thái Đơn hàng sang PAID & CONFIRMED
    await this.prisma.order.update({
      where: { orderCode },
      data: {
        paymentStatus: PaymentStatus.PAID,
        orderStatus: OrderStatus.CONFIRMED,
        paidAt: new Date(),
      },
    });

    // Lưu Redis key để chống Replay Attack (TTL 24 tiếng)
    await this.redis.setEx(redisKey, 86400, '1');

    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(order.totalAmount));

    // Phát thông báo Realtime tới Admin Dashboard
    void this.notificationsService.broadcastToAdmins({
      title: `Thanh toán thành công #${order.orderCode}`,
      content: `Ngân hàng đã xác nhận thanh toán thành công cho đơn hàng #${order.orderCode} (${formattedAmount}).`,
      type: NotificationType.PAYMENT_CONFIRMED,
      orderCode: order.orderCode,
      actionUrl: `/orders/${order.id}`,
    });

    return {
      success: true,
      message: 'Xác nhận thanh toán thành công qua Webhook',
      orderCode,
      paymentStatus: PaymentStatus.PAID,
    };
  }

  /**
   * Lấy lịch sử đơn hàng của User đăng nhập (Phân trang, Lọc trạng thái & Tìm kiếm)
   */
  async getMyOrders(
    userId: number,
    page = 1,
    limit = 10,
    status?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = { userId };

    if (status && status !== 'ALL') {
      if (Object.values(OrderStatus).includes(status as OrderStatus)) {
        whereClause.orderStatus = status as OrderStatus;
      }
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      whereClause.OR = [
        { orderCode: { contains: searchTerm } },
        { customerName: { contains: searchTerm } },
        {
          orderItems: {
            some: {
              productName: { contains: searchTerm },
            },
          },
        },
      ];
    }

    const [items, total, allUserOrders] = await Promise.all([
      this.prisma.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: true,
        },
      }),
      this.prisma.order.count({
        where: whereClause,
      }),
      this.prisma.order.findMany({
        where: { userId },
        select: { orderStatus: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {
      ALL: allUserOrders.length,
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPING: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    for (const o of allUserOrders) {
      if (statusCounts[o.orderStatus] !== undefined) {
        statusCounts[o.orderStatus]++;
      }
    }

    return {
      items: items.map((ord) => ({
        id: ord.id,
        orderCode: ord.orderCode,
        customerName: ord.customerName,
        subtotal: Number(ord.subtotal),
        totalAmount: Number(ord.totalAmount),
        shippingFee: Number(ord.shippingFee),
        discountAmount: Number(ord.discountAmount),
        pointsUsed: ord.pointsUsed || 0,
        pointsDiscount: Number(ord.pointsDiscount || 0),
        pointsEarned: ord.pointsEarned || 0,
        voucherCode: ord.voucherCode,
        paymentMethod: ord.paymentMethod,
        paymentStatus: ord.paymentStatus,
        orderStatus: ord.orderStatus,
        createdAt: ord.createdAt,
        paidAt: ord.paidAt,
        itemsCount: ord.orderItems.length,
        orderItems: ord.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productImageUrl: item.productImageUrl,
          price: Number(item.price),
          quantity: item.quantity,
          itemTotal: Number(item.itemTotal),
        })),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts,
    };
  }

  /**
   * Lấy chi tiết đơn hàng theo orderCode (Hỗ trợ cả User & Guest)
   */
  async getOrderDetail(orderCode: string, userId?: number) {
    const order = await this.prisma.order.findUnique({
      where: { orderCode },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${orderCode}`);
    }

    // Bảo mật: Nếu đơn hàng thuộc sở hữu của User khác -> Ném lỗi Forbidden
    if (order.userId && userId && order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập thông tin đơn hàng này');
    }

    let qrInfo: any = null;
    if (
      order.paymentMethod === PaymentMethod.QR_CODE &&
      order.paymentStatus === PaymentStatus.PENDING
    ) {
      const qrUrl = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${Number(
        order.totalAmount,
      )}&addInfo=${order.orderCode}&accountName=CONG%20TY%20TECHBITE`;

      qrInfo = {
        qrCodeUrl: qrUrl,
        bankName: 'MBBank (Ngân hàng Quân Đội)',
        accountNo: '0987654321',
        accountName: 'CÔNG TY TNHH TECHBITE ECOMMERCE',
        amount: Number(order.totalAmount),
        transferContent: order.orderCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    }

    return {
      id: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: `${order.detailAddress}, ${order.wardName}, ${order.districtName}, ${order.provinceName}`,
      shippingMethod: order.shippingMethod,
      shippingFee: Number(order.shippingFee),
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      pointsUsed: order.pointsUsed || 0,
      pointsDiscount: Number(order.pointsDiscount || 0),
      pointsEarned: order.pointsEarned || 0,
      voucherCode: order.voucherCode,
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      orderNote: order.orderNote,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      qrInfo,
      itemsCount: order.orderItems.length,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImageUrl: item.productImageUrl,
        price: Number(item.price),
        quantity: item.quantity,
        itemTotal: Number(item.itemTotal),
      })),
    };
  }
}
