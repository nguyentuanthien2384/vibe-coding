import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import {
  PublicSettingsResponse,
  SettingsResponse,
  SystemSettingsPayload,
} from './interfaces/system-settings.interface';

const PUBLIC_SETTINGS_CACHE_KEY = 'cache:v1:settings:public';
const CACHE_TTL_SECONDS = 3600;

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Lấy toàn bộ thông tin thiết lập hệ thống (phục vụ Admin Dashboard)
   */
  async getAllSettings(): Promise<SettingsResponse> {
    try {
      const records = await this.prisma.systemSetting.findMany();
      const settingsMap = new Map<string, any>();
      records.forEach((r) => {
        settingsMap.set(r.key, r.value);
      });

      // Lấy danh sách Banners để đưa vào payload tổng hợp cho Admin Dashboard
      const banners = await this.prisma.banner.findMany({
        orderBy: { order: 'asc' },
      });

      const formattedBanners = banners.map((b) => ({
        id: b.id.toString(),
        title: b.title,
        subtitle: b.subtitle ?? '',
        imageUrl: b.imageUrl,
        targetUrl: b.linkUrl ?? '',
        category: b.category,
        position: b.bannerPosition,
        order: b.order,
        isActive: b.isActive,
      }));

      const payload: SystemSettingsPayload = {
        general: settingsMap.get('general') ?? {
          storeName: 'TechBite - Chuỗi Cửa Hàng Công Nghệ & Đồ Ăn Đỉnh Cao',
          storeEmail: 'contact@techbite.vn',
          storePhone: '1900 6868',
          storeAddress: 'Tầng 12, Tòa nhà Innovation Tower, Cầu Giấy, Hà Nội',
          copyrightText: '© 2026 TechBite E-Commerce Platform.',
          logoUrl: '/images/logo-techbite.png',
          faviconUrl: '/images/favicon.ico',
        },
        payment: settingsMap.get('payment') ?? {
          bankName: 'MB Bank',
          bankAccountNo: '9999888899',
          bankAccountHolder: 'CTY TNHH TECHBITE VIETNAM',
          vietQrTemplate: 'compact',
          enableCod: true,
          paymentNote: 'Vui lòng kiểm tra lại đúng Mã Đơn Hàng...',
        },
        shipping: settingsMap.get('shipping') ?? {
          defaultShippingFee: 30000,
          freeShippingThreshold: 500000,
          estimatedDeliveryTime: '24 - 48 giờ đối với nội thành',
        },
        banners: formattedBanners,
        menus: settingsMap.get('menus') ?? [],
        seo: settingsMap.get('seo') ?? {
          metaTitle: 'TechBite - Sàn Thương Mại Điện Tử Công Nghệ',
          metaDescription: 'Mua sắm các thiết bị công nghệ chính hãng...',
          metaKeywords: 'TechBite, E-commerce, Công nghệ',
          facebookUrl: '',
          zaloUrl: '',
          instagramUrl: '',
          tiktokUrl: '',
        },
      };

      return {
        statusCode: 200,
        message: 'Lấy thông tin thiết lập hệ thống thành công',
        data: payload,
      };
    } catch (error) {
      this.logger.error('Failed to get system settings', error);
      throw new InternalServerErrorException('Không thể lấy thông tin thiết lập hệ thống');
    }
  }

  /**
   * Lấy thông tin cấu hình công khai phục vụ Storefront Frontend (có caching Redis)
   */
  async getPublicSettings(): Promise<PublicSettingsResponse> {
    try {
      const cachedRaw = await this.redisService.get(PUBLIC_SETTINGS_CACHE_KEY);
      if (cachedRaw) {
        try {
          const cachedData = JSON.parse(cachedRaw);
          return {
            statusCode: 200,
            message: 'Lấy thiết lập công khai thành công (Cache HIT)',
            data: cachedData,
          };
        } catch {
          // Ignore JSON parse error and fallback to DB
        }
      }

      const records = await this.prisma.systemSetting.findMany();
      const settingsMap = new Map<string, any>();
      records.forEach((r) => {
        settingsMap.set(r.key, r.value);
      });

      const publicData: Partial<SystemSettingsPayload> = {
        general: settingsMap.get('general'),
        payment: settingsMap.get('payment'),
        shipping: settingsMap.get('shipping'),
        menus: (settingsMap.get('menus') ?? []).filter((m: any) => m.isActive),
        seo: settingsMap.get('seo'),
      };

      await this.redisService.setEx(
        PUBLIC_SETTINGS_CACHE_KEY,
        CACHE_TTL_SECONDS,
        JSON.stringify(publicData),
      );

      return {
        statusCode: 200,
        message: 'Lấy thiết lập công khai thành công',
        data: publicData,
      };
    } catch (error) {
      this.logger.error('Failed to fetch public settings', error);
      throw new InternalServerErrorException('Không thể lấy thông tin cấu hình công khai');
    }
  }

  /**
   * Cập nhật thông số hệ thống và xóa rác Cache trên Redis
   */
  async updateSettings(dto: UpdateSystemSettingsDto): Promise<{ statusCode: number; message: string }> {
    try {
      const keysToUpdate = ['general', 'payment', 'shipping', 'menus', 'seo'];

      await this.prisma.$transaction(
        keysToUpdate.map((key) => {
          const value = (dto as any)[key];
          if (value === undefined) {
            return this.prisma.systemSetting.findUnique({ where: { key } });
          }
          return this.prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          });
        }),
      );

      // Purge Redis cache
      await this.redisService.del(PUBLIC_SETTINGS_CACHE_KEY);
      this.logger.log('System settings updated and Redis cache purged');

      return {
        statusCode: 200,
        message: 'Cập nhật thiết lập hệ thống thành công',
      };
    } catch (error) {
      this.logger.error('Failed to update system settings', error);
      throw new InternalServerErrorException('Không thể cập nhật thiết lập hệ thống');
    }
  }

  /**
   * Purge cache thủ công khi có sự thay đổi
   */
  async clearPublicCache(): Promise<void> {
    await this.redisService.del(PUBLIC_SETTINGS_CACHE_KEY);
  }
}
