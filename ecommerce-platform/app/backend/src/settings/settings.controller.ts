import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PublicSettingsResponse, SeoSocialSettings, MenuItemSetting } from './interfaces/system-settings.interface';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/v1/settings/public
   * Lấy cấu hình công khai cho Storefront (General, Payment, Shipping, Active Menus, SEO)
   * Cache Redis 1h — key: cache:v1:settings:public
   */
  @Get('public')
  @HttpCode(HttpStatus.OK)
  async getPublicSettings(): Promise<PublicSettingsResponse> {
    return this.settingsService.getPublicSettings();
  }

  /**
   * GET /api/v1/settings/seo
   * Lấy đầy đủ thẻ meta SEO, OpenGraph, GA4 ID cho Next.js generateMetadata()
   * Cache Redis 1h — key: cache:v1:settings:seo
   */
  @Get('seo')
  @HttpCode(HttpStatus.OK)
  async getSeoSettings(): Promise<{ statusCode: number; message: string; data: SeoSocialSettings }> {
    return this.settingsService.getPublicSeoSettings();
  }

  /**
   * GET /api/v1/settings/menus
   * Lấy danh sách Navigation Menu đang kích hoạt (Header, Footer) cho Storefront
   * Cache Redis 1h — key: cache:v1:settings:menus
   */
  @Get('menus')
  @HttpCode(HttpStatus.OK)
  async getMenus(): Promise<{ statusCode: number; message: string; data: MenuItemSetting[] }> {
    return this.settingsService.getPublicMenus();
  }
}
