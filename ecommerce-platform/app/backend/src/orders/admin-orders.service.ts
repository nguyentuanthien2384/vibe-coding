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
import { AdminOrdersExportDto } from './dto/admin-orders-export.dto';
import {
  AdminOrdersListResponse,
  AdminOrderDetailResponse,
  AdminOrderMutateResponse,
} from './interfaces/admin-order.interface';
import { OrderStatus, PaymentStatus, NotificationType, Prisma } from '@prisma/client';

import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PointsService } from '../points/points.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
    private readonly pointsService: PointsService,
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
          pointsUsed: order.pointsUsed || 0,
          pointsDiscount: Number(order.pointsDiscount || 0),
          pointsEarned: order.pointsEarned || 0,
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

    // Kiểm tra thực tế trạng thái đơn hàng / thanh toán có thay đổi hay không
    const hasOrderStatusChanged =
      dto.orderStatus !== undefined && dto.orderStatus !== order.orderStatus;
    const hasPaymentStatusChanged =
      updatedOrder.paymentStatus !== order.paymentStatus;

    if (!hasOrderStatusChanged && !hasPaymentStatusChanged) {
      this.logger.log(
        `[Notification Skipped] Trạng thái đơn hàng ${order.orderCode} không thay đổi (${order.orderStatus} / ${order.paymentStatus}). Không kích hoạt thông báo.`,
      );
    } else {
      // 5. Gửi Email thông báo bất đồng bộ cho Khách hàng khi trạng thái có THAY ĐỔI
      try {
        // 5.1. Thông báo Email khi trạng thái Đơn hàng thay đổi (Áp dụng cho mọi mốc trạng thái: CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, REFUNDED...)
        if (hasOrderStatusChanged) {
          await this.mailService.sendOrderStatusUpdatedNotification({
            userId: order.userId || undefined,
            email: order.customerEmail,
            customerName: order.customerName,
            orderCode: order.orderCode,
            orderStatus: updatedOrder.orderStatus,
            totalAmount: Number(order.totalAmount),
            cancelReason: updatedOrder.cancelReason || undefined,
          });
        }

        // 5.2. Thông báo khi Admin Xác nhận thanh toán thành công (PAID)
        if (
          hasPaymentStatusChanged &&
          updatedOrder.paymentStatus === PaymentStatus.PAID
        ) {
          await this.mailService.sendPaymentConfirmedNotification({
            userId: order.userId || undefined,
            email: order.customerEmail,
            customerName: order.customerName,
            orderCode: order.orderCode,
            totalAmount: Number(order.totalAmount),
            paymentMethod: order.paymentMethod,
          });
        }
      } catch (mailErr: any) {
        this.logger.error(
          `Lỗi khi kích hoạt gửi email thông báo đơn hàng ${order.orderCode}: ${mailErr.message}`,
        );
      }

      // 6. Gửi Real-time In-App Push Notification khi trạng thái có THAY ĐỔI
      try {
        if (order.userId) {
          if (hasOrderStatusChanged) {
            const statusLabels: Record<string, string> = {
              PENDING: 'Chờ xác nhận ⏳',
              CONFIRMED: 'Đã xác nhận và chuyển sang bộ phận chuẩn bị',
              PROCESSING: 'Đang được chế biến / đóng gói 🍳',
              SHIPPING: 'Đang trên đường giao tới bạn 🚚',
              DELIVERED: 'Đã giao hàng hoàn tất thành công 🎉',
              CANCELLED: 'Đã bị hủy ❌',
              REFUNDED: 'Đã được hoàn tiền 💸',
            };
            const label = statusLabels[updatedOrder.orderStatus] || updatedOrder.orderStatus;
            await this.notificationsService.createNotification({
              userId: order.userId,
              title: `Đơn hàng #${order.orderCode} cập nhật trạng thái`,
              content: `Đơn hàng #${order.orderCode} của bạn hiện: ${label}.`,
              type: NotificationType.ORDER_STATUS_CHANGED,
              orderCode: order.orderCode,
            });
          }

          if (
            hasPaymentStatusChanged &&
            updatedOrder.paymentStatus === PaymentStatus.PAID
          ) {
            await this.notificationsService.createNotification({
              userId: order.userId,
              title: `Xác nhận thanh toán đơn hàng #${order.orderCode}`,
              content: `Đơn hàng #${order.orderCode} đã được ghi nhận thanh toán thành công. Cảm ơn bạn! 💳`,
              type: NotificationType.PAYMENT_CONFIRMED,
              orderCode: order.orderCode,
            });
          }
        } else {
          this.logger.log(
            `[In-App Notification Skipped] Đơn hàng #${order.orderCode} là đơn khách vãng lai (không có userId). Đã phát Email thông báo tới ${order.customerEmail}.`,
          );
        }
      } catch (notifErr: any) {
        this.logger.error(
          `Lỗi khi phát Realtime In-App Notification cho đơn hàng ${order.orderCode}: ${notifErr.message}`,
        );
      }

      // 7. Xử lý Tích điểm & Hoàn điểm tự động (Loyalty Points Lifecycle)
      try {
        // 7.1. Tích điểm khi đơn hàng hoàn tất DELIVERED
        if (
          hasOrderStatusChanged &&
          updatedOrder.orderStatus === OrderStatus.DELIVERED
        ) {
          void this.pointsService.earnPointsFromOrder(order.id);
        }

        // 7.2. Hoàn trả điểm khi đơn hàng bị HỦY (CANCELLED)
        if (isCancelling) {
          void this.pointsService.refundPointsFromOrder(order.id);
        }
      } catch (pointsErr: any) {
        this.logger.error(
          `Lỗi khi kích hoạt xử lý điểm thưởng cho đơn hàng #${order.orderCode}: ${pointsErr.message}`,
        );
      }
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

  /**
   * GET /api/v1/admin/orders/export
   * Xuất báo cáo danh sách đơn hàng theo điều kiện lọc ra chuỗi CSV (UTF-8 BOM)
   */
  async exportOrdersReport(dto: AdminOrdersExportDto): Promise<string> {
    const {
      search,
      orderStatus,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
    } = dto;

    const where: Prisma.OrderWhereInput = {};

    if (search && search.trim() !== '') {
      const keyword = search.trim();
      where.OR = [
        { orderCode: { contains: keyword } },
        { customerName: { contains: keyword } },
        { customerEmail: { contains: keyword } },
        { customerPhone: { contains: keyword } },
      ];
    }

    if (orderStatus && orderStatus !== 'ALL') {
      where.orderStatus = orderStatus as OrderStatus;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod as any;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    const statusMap: Record<string, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPING: 'Đang giao hàng',
      DELIVERED: 'Đã giao thành công',
      CANCELLED: 'Đã hủy',
      REFUNDED: 'Đã hoàn tiền',
    };

    const paymentStatusMap: Record<string, string> = {
      PENDING: 'Chưa thanh toán',
      PAID: 'Đã thanh toán',
      FAILED: 'Thanh toán thất bại',
      REFUNDED: 'Đã hoàn tiền',
    };

    const escapeCsvField = (field: any) => {
      if (field === null || field === undefined) return '""';
      const str = String(field).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'STT',
      'Mã đơn hàng',
      'Tên khách hàng',
      'Số điện thoại',
      'Email',
      'Tỉnh/Thành',
      'Quận/Huyện',
      'Phường/Xã',
      'Địa chỉ chi tiết',
      'Số lượng món',
      'Tạm tính (VND)',
      'Giảm giá (VND)',
      'Mã Voucher',
      'Phí ship (VND)',
      'Tổng tiền (VND)',
      'PT Thanh toán',
      'TT Thanh toán',
      'TT Đơn hàng',
      'Ghi chú đơn hàng',
      'Lý do hủy (nếu có)',
      'Ngày khởi tạo',
    ];

    const csvRows: string[] = [];
    csvRows.push(headers.map(escapeCsvField).join(','));

    orders.forEach((order, index) => {
      const row = [
        index + 1,
        order.orderCode,
        order.customerName,
        order.customerPhone,
        order.customerEmail || '',
        order.provinceName || '',
        order.districtName || '',
        order.wardName || '',
        order.detailAddress || '',
        order._count.orderItems,
        Number(order.subtotal),
        Number(order.discountAmount),
        order.voucherCode || '',
        Number(order.shippingFee),
        Number(order.totalAmount),
        order.paymentMethod,
        paymentStatusMap[order.paymentStatus] || order.paymentStatus,
        statusMap[order.orderStatus] || order.orderStatus,
        order.orderNote || '',
        order.cancelReason || '',
        new Date(order.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      ];
      csvRows.push(row.map(escapeCsvField).join(','));
    });

    return '\uFEFF' + csvRows.join('\n');
  }

  /**
   * GET /api/v1/admin/orders/export (định dạng Excel .xlsx)
   * Xuất báo cáo danh sách đơn hàng ra file Excel thực sự (.xlsx) bằng ExcelJS
   */
  async exportOrdersReportExcel(dto: AdminOrdersExportDto): Promise<Buffer> {
    const {
      search,
      orderStatus,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
    } = dto;

    const where: Prisma.OrderWhereInput = {};

    if (search && search.trim() !== '') {
      const keyword = search.trim();
      where.OR = [
        { orderCode: { contains: keyword } },
        { customerName: { contains: keyword } },
        { customerEmail: { contains: keyword } },
        { customerPhone: { contains: keyword } },
      ];
    }

    if (orderStatus && orderStatus !== 'ALL') {
      where.orderStatus = orderStatus as OrderStatus;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod as any;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TechBite E-Commerce System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Báo Cáo Đơn Hàng', {
      views: [{ showGridLines: true }],
    });

    // Cấu hình các cột Excel
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Mã Đơn Hàng', key: 'orderCode', width: 22 },
      { header: 'Tên Khách Hàng', key: 'customerName', width: 24 },
      { header: 'Số Điện Thoại', key: 'customerPhone', width: 16 },
      { header: 'Email', key: 'customerEmail', width: 25 },
      { header: 'Tỉnh / Thành', key: 'provinceName', width: 18 },
      { header: 'Quận / Huyện', key: 'districtName', width: 18 },
      { header: 'Phường / Xã', key: 'wardName', width: 18 },
      { header: 'Địa Chỉ Chi Tiết', key: 'detailAddress', width: 32 },
      { header: 'Số Món', key: 'itemCount', width: 10 },
      { header: 'Tạm Tính (VNĐ)', key: 'subtotal', width: 18 },
      { header: 'Giảm Giá (VNĐ)', key: 'discountAmount', width: 18 },
      { header: 'Mã Voucher', key: 'voucherCode', width: 15 },
      { header: 'Phí Ship (VNĐ)', key: 'shippingFee', width: 16 },
      { header: 'Tổng Tiền (VNĐ)', key: 'totalAmount', width: 20 },
      { header: 'PT Thanh Toán', key: 'paymentMethod', width: 16 },
      { header: 'TT Thanh Toán', key: 'paymentStatus', width: 18 },
      { header: 'TT Đơn Hàng', key: 'orderStatus', width: 20 },
      { header: 'Ghi Chú Đơn Hàng', key: 'orderNote', width: 25 },
      { header: 'Lý Do Hủy', key: 'cancelReason', width: 25 },
      { header: 'Ngày Khởi Tạo', key: 'createdAt', width: 20 },
    ];

    // Định dạng Hàng Tiêu Đề (Header Row)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4880FF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });

    const statusMap: Record<string, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPING: 'Đang giao hàng',
      DELIVERED: 'Đã hoàn thành',
      CANCELLED: 'Đã hủy',
      REFUNDED: 'Đã hoàn tiền',
    };

    const paymentStatusMap: Record<string, string> = {
      PENDING: 'Chưa thanh toán',
      UNPAID: 'Chưa thanh toán',
      PAID: 'Đã thanh toán',
      FAILED: 'Thất bại',
      EXPIRED: 'Hết hạn',
      REFUNDED: 'Đã hoàn tiền',
    };

    // Đưa dữ liệu từng đơn hàng vào bảng
    orders.forEach((order, index) => {
      const row = worksheet.addRow({
        stt: index + 1,
        orderCode: order.orderCode,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail || '',
        provinceName: order.provinceName || '',
        districtName: order.districtName || '',
        wardName: order.wardName || '',
        detailAddress: order.detailAddress || '',
        itemCount: order._count.orderItems,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        voucherCode: order.voucherCode || '',
        shippingFee: Number(order.shippingFee),
        totalAmount: Number(order.totalAmount),
        paymentMethod: order.paymentMethod,
        paymentStatus: paymentStatusMap[order.paymentStatus] || order.paymentStatus,
        orderStatus: statusMap[order.orderStatus] || order.orderStatus,
        orderNote: order.orderNote || '',
        cancelReason: order.cancelReason || '',
        createdAt: new Date(order.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      });

      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = { vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        // Căn giữa cho STT, số món
        if ([1, 10].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
        // Định dạng tiền tệ cho các cột Tạm tính, Giảm giá, Phí ship, Tổng tiền
        if ([11, 12, 14, 15].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0 "đ"';
        }
      });
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
