import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/auth-response.interface';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * GET /api/v1/cart
   * Lấy chi tiết thông tin giỏ hàng hiện tại
   */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getCart(
    @CurrentUser() user: JwtPayload | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = user?.sub;
    const cart = await this.cartService.getCart(userId, sessionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin giỏ hàng thành công',
      data: cart,
    };
  }

  /**
   * POST /api/v1/cart/items
   * Thêm sản phẩm mới hoặc tăng số lượng sản phẩm trong giỏ
   */
  @Post('items')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async addToCart(
    @Body() dto: AddToCartDto,
    @CurrentUser() user: JwtPayload | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = user?.sub;
    const cart = await this.cartService.addToCart(dto, userId, sessionId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Đã thêm sản phẩm vào giỏ hàng',
      data: cart,
    };
  }

  /**
   * PATCH /api/v1/cart/items/:id
   * Cập nhật số lượng của một dòng sản phẩm cụ thể trong giỏ
   */
  @Patch('items/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async updateCartItem(
    @Param('id', ParseIntPipe) cartItemId: number,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: JwtPayload | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = user?.sub;
    const cart = await this.cartService.updateCartItem(
      cartItemId,
      dto,
      userId,
      sessionId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật số lượng sản phẩm thành công',
      data: cart,
    };
  }

  /**
   * DELETE /api/v1/cart/items/:id
   * Xóa 1 dòng sản phẩm khỏi giỏ hàng
   */
  @Delete('items/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async removeCartItem(
    @Param('id', ParseIntPipe) cartItemId: number,
    @CurrentUser() user: JwtPayload | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = user?.sub;
    const cart = await this.cartService.removeCartItem(
      cartItemId,
      userId,
      sessionId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
      data: cart,
    };
  }

  /**
   * DELETE /api/v1/cart
   * Xóa toàn bộ sản phẩm trong giỏ hàng (Clear Cart)
   */
  @Delete()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async clearCart(
    @CurrentUser() user: JwtPayload | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = user?.sub;
    const cart = await this.cartService.clearCart(userId, sessionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã dọn dẹp toàn bộ giỏ hàng',
      data: cart,
    };
  }

  /**
   * POST /api/v1/cart/merge
   * Đồng bộ sản phẩm từ giỏ hàng vãng lai (Guest) vào giỏ hàng của User sau khi Đăng Nhập
   */
  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async mergeCart(
    @Body() dto: MergeCartDto,
    @CurrentUser('sub') userId: number,
  ) {
    const cart = await this.cartService.mergeCart(userId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đồng bộ giỏ hàng thành công',
      data: cart,
    };
  }

  /**
   * POST /api/v1/cart/sync-guest
   * Đồng bộ sản phẩm từ giỏ hàng User sang Guest Session khi Đăng Xuất
   */
  @Post('sync-guest')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async syncGuestCart(
    @CurrentUser('sub') userId: number,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const cart = await this.cartService.syncGuestCart(userId, sessionId || '');
    return {
      statusCode: HttpStatus.OK,
      message: 'Đồng bộ giỏ hàng vãng lai khi đăng xuất thành công',
      data: cart,
    };
  }
}
