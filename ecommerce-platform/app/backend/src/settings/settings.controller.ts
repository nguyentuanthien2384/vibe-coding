import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PublicSettingsResponse } from './interfaces/system-settings.interface';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/v1/settings/public
   * Lấy danh sách cấu hình công khai (General, Payment, Shipping, Active Menus, SEO) cho Storefront
   */
  @Get('public')
  @HttpCode(HttpStatus.OK)
  async getPublicSettings(): Promise<PublicSettingsResponse> {
    return this.settingsService.getPublicSettings();
  }
}
