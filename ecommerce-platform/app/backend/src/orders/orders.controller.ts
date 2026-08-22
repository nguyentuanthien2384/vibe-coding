import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/auth-response.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /api/v1/orders
   * Khởi tạo Đơn hàng mới (Cho cả Guest vãng lai & User đã đăng nhập)
   */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: JwtPayload | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = user?.sub;
    const data = await this.ordersService.createOrder(dto, userId, sessionId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Khởi tạo đơn hàng thành công',
      data,
    };
  }

  /**
   * GET /api/v1/orders/my-orders
   * Lấy danh sách lịch sử đơn hàng của User đăng nhập (Phân trang, lọc trạng thái, tìm kiếm)
   */
  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getMyOrders(
    @CurrentUser('sub') userId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const data = await this.ordersService.getMyOrders(
      userId,
      pageNum,
      limitNum,
      status,
      search,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách đơn hàng thành công',
      data,
    };
  }

  /**
   * GET /api/v1/orders/:orderCode
   * Lấy chi tiết đơn hàng theo mã đơn (Hỗ trợ cả User & Guest)
   */
  @Get(':orderCode')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getOrderDetail(
    @Param('orderCode') orderCode: string,
    @CurrentUser('sub') userId?: number,
  ) {
    const data = await this.ordersService.getOrderDetail(orderCode, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy chi tiết đơn hàng thành công',
      data,
    };
  }

  /**
   * GET /api/v1/orders/:orderCode/status
   * Polling kiểm tra trạng thái thanh toán đơn hàng theo mã đơn
   */
  @Get(':orderCode/status')
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  async getOrderStatus(@Param('orderCode') orderCode: string) {
    const data = await this.ordersService.getOrderStatus(orderCode);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy trạng thái đơn hàng thành công',
      data,
    };
  }

  @Post(':orderCode/demo-confirm-payment')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async confirmDemoPayment(@Param('orderCode') orderCode: string) {
    const data = await this.ordersService.confirmDemoPayment(orderCode);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xác nhận thanh toán demo thành công',
      data,
    };
  }

  /**
   * POST /api/v1/orders/webhook/payment
   * Cổng tiếp nhận Webhook chuyển khoản tự động từ ngân hàng
   */
  @Post('webhook/payment')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async handlePaymentWebhook(@Body() dto: PaymentWebhookDto) {
    const data = await this.ordersService.handlePaymentWebhook(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xử lý webhook thanh toán thành công',
      data,
    };
  }
}
