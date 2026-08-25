import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Role } from '@prisma/client';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { UpdatePointsConfigDto } from './dto/update-points-config.dto';
import { PointsHistoryQueryDto } from './dto/points-history-query.dto';

@Controller('admin/points')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminPointsController {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * 1. GET /api/v1/admin/points/config
   * Quản trị viên lấy thông tin cấu hình hệ thống điểm
   */
  @Get('config')
  @Roles(Role.ADMIN, Role.STAFF)
  @RequirePermissions('point.manage', 'setting.manage')
  async getConfig() {
    const config = await this.pointsService.getPointsConfig();
    return {
      statusCode: 200,
      message: 'Lấy cấu hình điểm thành công',
      data: config,
    };
  }

  /**
   * 2. PATCH /api/v1/admin/points/config
   * Quản trị viên cập nhật cấu hình hệ thống điểm
   */
  @Patch('config')
  @Roles(Role.ADMIN, Role.STAFF)
  @RequirePermissions('point.manage', 'setting.manage')
  async updateConfig(@Body() dto: UpdatePointsConfigDto) {
    const updated = await this.pointsService.updatePointsConfig(dto);
    return {
      statusCode: 200,
      message: 'Cập nhật cấu hình điểm thành công',
      data: updated,
    };
  }

  /**
   * 3. GET /api/v1/admin/points/customers/:userId/history
   * Xem lịch sử biến động điểm của một khách hàng cụ thể
   */
  @Get('customers/:userId/history')
  @Roles(Role.ADMIN, Role.STAFF)
  @RequirePermissions('point.manage', 'customer.view')
  async getCustomerPointsHistory(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: PointsHistoryQueryDto,
  ) {
    const history = await this.pointsService.getUserPointsHistory(userId, query);
    return {
      statusCode: 200,
      message: 'Lấy lịch sử điểm khách hàng thành công',
      data: history,
    };
  }

  /**
   * 4. POST /api/v1/admin/points/adjust
   * Quản trị viên điều chỉnh thủ công điểm số của khách hàng
   */
  @Post('adjust')
  @Roles(Role.ADMIN, Role.STAFF)
  @RequirePermissions('point.manage')
  async adjustPoints(@Body() dto: AdjustPointsDto) {
    const result = await this.pointsService.adjustPointsManual(dto);
    return {
      statusCode: 200,
      message: 'Điều chỉnh điểm thủ công thành công',
      data: result,
    };
  }
}
