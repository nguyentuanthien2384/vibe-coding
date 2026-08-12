import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GetAdminOrdersDto } from './dto/get-admin-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  AdminOrdersListResponse,
  AdminOrderDetailResponse,
  AdminOrderMutateResponse,
} from './interfaces/admin-order.interface';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * GET /api/v1/admin/orders
   * Lấy danh sách đơn hàng cho Admin Dashboard có phân trang, bộ lọc và thống kê tổng quan
   */
  async findAll(dto: GetAdminOrdersDto): Promise<AdminOrdersListResponse> {
    const {
      search,
      orderStatus,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;

    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {};

    // 1. Ô tìm kiếm debounced (Mã đơn hàng, Tên khách, Email, SĐT)
    if (search && search.trim() !== '') {
      const keyword = search.trim();
      where.OR = [
        { orderCode: { contains: keyword } },
        { customerName: { contains: keyword } },
        { customerEmail: { contains: keyword } },
        { customerPhone: { contains: keyword } },
      ];
    }

    // 2. Bộ lọc trạng thái đơn hàng
    if (orderStatus && orderStatus !== 'ALL') {
      where.orderStatus = orderStatus as OrderStatus;
    }

    // 3. Bộ lọc trạng thái thanh toán
    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    // 4. Bộ lọc phương thức thanh toán
    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod as any;
    }

    // 5. Bộ lọc khoảng ngày khởi tạo (startDate -> endDate)
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    // 6. Thực thi truy vấn danh sách & tổng số đơn thỏa điều kiện
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          _count: {
            select: { orderItems: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    // 7. Lấy thống kê tổng quan (Dashboard Summary Stats)
    const [
      totalOrders,
      pendingCount,
      confirmedCount,
      processingCount,
      shippingCount,
      deliveredCount,
      cancelledCount,
      unpaidCount,
      paidCount,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.CONFIRMED } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.PROCESSING } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.SHIPPING } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.CANCELLED } }),
      this.prisma.order.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
      this.prisma.order.count({ where: { paymentStatus: PaymentStatus.PAID } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      statusCode: 200,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders.map((order) => ({
        id: order.id,
        orderCode: order.orderCode,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        totalAmount: Number(order.totalAmount),
        itemCount: order._count.orderItems,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      summaryStats: {
        totalOrders,
        pendingCount,
        confirmedCount,
        processingCount,
        shippingCount,
        deliveredCount,
        cancelledCount,
        unpaidCount,
        paidCount,
      },
    };
  }

  /**
   * GET /api/v1/admin/orders/:id
   * Lấy chi tiết đơn hàng theo ID hoặc OrderCode
   */
  async findOne(idOrCode: string | number): Promise<AdminOrderDetailResponse> {
    const isNumber = !isNaN(Number(idOrCode));

    const order = await this.prisma.order.findFirst({
      where: isNumber
        ? { id: Number(idOrCode) }
        : { orderCode: String(idOrCode) },
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Không tìm thấy đơn hàng với ID hoặc mã code đã cung cấp',
      );
    }

    return {
      statusCode: 200,
      message: 'Lấy chi tiết đơn hàng thành công',
      data: {
        id: order.id,
        orderCode: order.orderCode,
        customer: {
          id: order.userId,
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
        },
        shippingAddress: {
          recipientName: order.customerName,
          phone: order.customerPhone,
          provinceName: order.provinceName,
          districtName: order.districtName,
          wardName: order.wardName,
          detailAddress: order.detailAddress,
          note: order.orderNote,
        },
        items: order.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productImageUrl: item.productImageUrl,
          price: Number(item.price),
          originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
          quantity: item.quantity,
          itemTotal: Number(item.itemTotal),
        })),
        summary: {
          subtotal: Number(order.subtotal),
          shippingFee: Number(order.shippingFee),
          discountAmount: Number(order.discountAmount),
          voucherCode: order.voucherCode,
          totalAmount: Number(order.totalAmount),
        },
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        paidAt: order.paidAt,
        completedAt: order.completedAt,
        cancelledAt: order.cancelledAt,
        cancelReason: order.cancelReason,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    };
  }

  /**
   * PATCH /api/v1/admin/orders/:id/status
   * Cập nhật trạng thái đơn hàng & trạng thái thanh toán
   */
  async updateStatus(
    id: number,
    dto: UpdateOrderStatusDto,
  ): Promise<AdminOrderMutateResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng với ID đã cung cấp');
    }

    // 1. Validation Ma trận chuyển đổi trạng thái (State Machine Validation)
    if (dto.orderStatus) {
      const current = order.orderStatus;
      const next = dto.orderStatus;

      if (current === OrderStatus.DELIVERED && next !== OrderStatus.DELIVERED) {
        throw new BadRequestException(
          'Không thể chuyển trạng thái đơn hàng đã hoàn tất (DELIVERED)',
        );
      }

      if (current === OrderStatus.CANCELLED && next !== OrderStatus.CANCELLED) {
        throw new BadRequestException(
          'Không thể chuyển trạng thái đơn hàng đã bị hủy (CANCELLED)',
        );
      }
    }

    // 2. Chuẩn bị dữ liệu cập nhật
    const updateData: Prisma.OrderUpdateInput = {};

    if (dto.orderStatus) {
      updateData.orderStatus = dto.orderStatus;

      if (dto.orderStatus === OrderStatus.DELIVERED && !order.completedAt) {
        updateData.completedAt = new Date();

        // Nếu đơn hàng thanh toán COD và chưa ghi nhận PAID, tự động chuyển sang PAID
        if (order.paymentMethod === 'COD' && order.paymentStatus !== PaymentStatus.PAID) {
          updateData.paymentStatus = PaymentStatus.PAID;
          updateData.paidAt = new Date();
        }
      }

      if (dto.orderStatus === OrderStatus.CANCELLED && !order.cancelledAt) {
        updateData.cancelledAt = new Date();
        updateData.cancelReason = dto.cancelReason || dto.adminNote || 'Hủy bởi Admin';
      }
    }

    if (dto.paymentStatus) {
      updateData.paymentStatus = dto.paymentStatus;
      if (dto.paymentStatus === PaymentStatus.PAID && !order.paidAt) {
        updateData.paidAt = new Date();
      }
    }

    // 3. Thực thi Transaction (Nếu chuyển thành CANCELLED thì hoàn trả stock vào kho sản phẩm)
    const isCancelling =
      dto.orderStatus === OrderStatus.CANCELLED &&
      order.orderStatus !== OrderStatus.CANCELLED;

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: updateData,
      });

      if (isCancelling) {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return updated;
    });

    // 4. Invalidate Redis Cache của người dùng liên quan
    try {
      if (order.userId) {
        await this.redisService.del(`cache:v1:orders:user:${order.userId}:*`);
      }
      await this.redisService.del(`cache:v1:orders:detail:${order.orderCode}`);
    } catch (error) {
      this.logger.warn(`Lỗi xóa Redis Cache khi cập nhật đơn hàng: ${error.message}`);
    }

    return {
      statusCode: 200,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: {
        id: updatedOrder.id,
        orderCode: updatedOrder.orderCode,
        orderStatus: updatedOrder.orderStatus,
        paymentStatus: updatedOrder.paymentStatus,
        paidAt: updatedOrder.paidAt,
        completedAt: updatedOrder.completedAt,
        cancelledAt: updatedOrder.cancelledAt,
        updatedAt: updatedOrder.updatedAt,
      },
    };
  }
}
