import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AdminOrdersService } from './admin-orders.service';
import { GetAdminOrdersDto } from './dto/get-admin-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrdersExportDto } from './dto/admin-orders-export.dto';
import {
  AdminOrdersListResponse,
  AdminOrderDetailResponse,
  AdminOrderMutateResponse,
} from './interfaces/admin-order.interface';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  /**
   * GET /api/v1/admin/orders
   * Lấy danh sách đơn hàng cho Admin Dashboard có phân trang, bộ lọc và thống kê
   * Quyền: ADMIN, STAFF (Yêu cầu order.view hoặc order.update_status)
   */
  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @RequirePermissions('order.view', 'order.update_status')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() dto: GetAdminOrdersDto): Promise<AdminOrdersListResponse> {
    return this.adminOrdersService.findAll(dto);
  }

  /**
   * GET /api/v1/admin/orders/export
   * Xuất báo cáo danh sách đơn hàng ra file Excel (.xlsx) chuẩn
   * Quyền: ADMIN, STAFF (Yêu cầu report.export hoặc order.view)
   */
  @Get('export')
  @Roles(Role.ADMIN, Role.STAFF)
  @RequirePermissions('report.export', 'order.view')
  async exportReport(
    @Query() dto: AdminOrdersExportDto,
    @Res() res: any,
  ): Promise<void> {
    const excelBuffer = await this.adminOrdersService.exportOrdersReportExcel(dto);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `bao-cao-don-hang-${timestamp}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(excelBuffer);
  }

  /**
   * GET /api/v1/admin/orders/:id
   * Lấy chi tiết đơn hàng theo ID hoặc OrderCode
   * Quyền: ADMIN, STAFF (Yêu cầu order.view hoặc order.update_status)
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @RequirePermissions('order.view', 'order.update_status')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<AdminOrderDetailResponse> {
    return this.adminOrdersService.findOne(id);
  }

  /**
   * PATCH /api/v1/admin/orders/:id/status
   * Cập nhật trạng thái đơn hàng & trạng thái thanh toán
   * Quyền: ADMIN, STAFF (Yêu cầu order.update_status hoặc payment.confirm)
   */
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.STAFF)
  @RequirePermissions('order.update_status', 'payment.confirm')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<AdminOrderMutateResponse> {
    return this.adminOrdersService.updateStatus(id, dto);
  }
}

