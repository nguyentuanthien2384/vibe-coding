import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SettingsService } from './settings.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { GeneralSettingsDto } from './dto/general-settings.dto';
import { MenuItemSettingDto } from './dto/menu-settings.dto';
import { SeoSocialSettingsDto } from './dto/seo-settings.dto';
import { EmailSettingsDto, TestEmailConnectionDto } from './dto/email-settings.dto';
import { SettingsResponse } from './interfaces/system-settings.interface';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/v1/admin/settings
   * Lấy toàn bộ cấu hình hệ thống (General, Payment, Shipping, Banners, Menus, SEO, Email)
   * Quyền: ADMIN, STAFF
   */
  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  async getAllSettings(): Promise<SettingsResponse> {
    return this.settingsService.getAllSettings();
  }

  /**
   * GET /api/v1/admin/settings/:group
   * Lấy chi tiết một nhóm cấu hình (general | payment | shipping | menus | seo | email)
   * Quyền: ADMIN, STAFF (email chỉ ADMIN)
   */
  @Get(':group')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  async getGroupSettings(
    @Param('group') group: string,
  ): Promise<{ statusCode: number; message: string; data: unknown }> {
    return this.settingsService.getGroupSettings(group);
  }

  /**
   * PUT /api/v1/admin/settings
   * Cập nhật đồng loạt thông số cấu hình hệ thống
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

  /**
   * PATCH /api/v1/admin/settings/general
   * Cập nhật nhanh Cấu hình chung
   * Quyền: ADMIN
   */
  @Patch('general')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async patchGeneral(
    @Body() dto: GeneralSettingsDto,
  ): Promise<{ statusCode: number; message: string }> {
    return this.settingsService.patchGroupSettings('general', dto);
  }

  /**
   * PATCH /api/v1/admin/settings/menus
   * Cập nhật nhanh Menu Navigation
   * Quyền: ADMIN
   */
  @Patch('menus')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async patchMenus(
    @Body() dto: MenuItemSettingDto[],
  ): Promise<{ statusCode: number; message: string }> {
    return this.settingsService.patchGroupSettings('menus', dto);
  }

  /**
   * PATCH /api/v1/admin/settings/seo
   * Cập nhật nhanh cấu hình SEO & Social
   * Quyền: ADMIN
   */
  @Patch('seo')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async patchSeo(
    @Body() dto: SeoSocialSettingsDto,
  ): Promise<{ statusCode: number; message: string }> {
    return this.settingsService.patchGroupSettings('seo', dto);
  }

  /**
   * PATCH /api/v1/admin/settings/email
   * Cập nhật nhanh cấu hình Email SMTP
   * Quyền: ADMIN
   */
  @Patch('email')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async patchEmail(
    @Body() dto: EmailSettingsDto,
  ): Promise<{ statusCode: number; message: string }> {
    return this.settingsService.patchGroupSettings('email', dto);
  }

  /**
   * POST /api/v1/admin/settings/email/test
   * Gửi email thử nghiệm để kiểm tra cấu hình SMTP hiện tại hoặc customSettings từ Form
   * Quyền: ADMIN
   */
  @Post('email/test')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async testEmailConnection(
    @Body() dto: TestEmailConnectionDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.settingsService.testEmailConnection(dto);
  }
}
