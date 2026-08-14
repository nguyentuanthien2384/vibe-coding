import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SettingsService } from './settings.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { SettingsResponse } from './interfaces/system-settings.interface';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/v1/admin/settings
   * Lấy toàn bộ cấu hình hệ thống (General, Payment, Shipping, Banners, Menus, SEO)
   * Quyền: ADMIN, STAFF
   */
  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  async getAllSettings(): Promise<SettingsResponse> {
    return this.settingsService.getAllSettings();
  }

  /**
   * PUT /api/v1/admin/settings
   * Cập nhật thông số cấu hình hệ thống
   * Quyền: ADMIN
   */
  @Put()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateSettings(
    @Body() dto: UpdateSystemSettingsDto,
  ): Promise<{ statusCode: number; message: string }> {
    return this.settingsService.updateSettings(dto);
  }
}
