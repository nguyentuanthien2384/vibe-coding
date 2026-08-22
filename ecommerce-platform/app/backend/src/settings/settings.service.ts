import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { EmailSettingsDto } from './dto/email-settings.dto';
import { TestEmailConnectionDto } from './dto/email-settings.dto';
import {
  EmailSettings,
  EmailSettingsResponse,
  GeneralSettings,
  MenuItemSetting,
  PaymentSettings,
  PublicSettingsResponse,
  SettingsResponse,
  SeoSocialSettings,
  ShippingSettings,
  SystemSettingsPayload,
} from './interfaces/system-settings.interface';

const CACHE_PUBLIC_KEY = 'cache:v1:settings:public';
const CACHE_SEO_KEY = 'cache:v1:settings:seo';
const CACHE_MENUS_KEY = 'cache:v1:settings:menus';
const CACHE_TTL = 3600;

const DEFAULT_GENERAL: GeneralSettings = {
  storeName: 'TechBite - Chuỗi Cửa Hàng Công Nghệ & Đồ Ăn Đỉnh Cao',
  storeEmail: 'contact@techbite.vn',
  storePhone: '1900 6868',
  hotline: '',
  storeAddress: 'Tầng 12, Tòa nhà Innovation Tower, Cầu Giấy, Hà Nội',
  copyrightText: '© 2026 TechBite E-Commerce Platform.',
  logoUrl: '/images/logo-techbite.png',
  faviconUrl: '/images/favicon.ico',
  workingHours: '08:00 - 22:00 (Thứ 2 - Chủ Nhật)',
  maintenanceMode: false,
  maintenanceMessage: '',
};

const DEFAULT_PAYMENT: PaymentSettings = {
  bankName: 'MB Bank',
  bankAccountNo: '9999888899',
  bankAccountHolder: 'CTY TNHH TECHBITE VIETNAM',
  vietQrTemplate: 'compact',
  enableCod: true,
  paymentNote: '',
};

const DEFAULT_SHIPPING: ShippingSettings = {
  defaultShippingFee: 30000,
  freeShippingThreshold: 500000,
  estimatedDeliveryTime: '24 - 48 giờ đối với nội thành',
};

const DEFAULT_SEO: SeoSocialSettings = {
  metaTitle: 'TechBite - Sàn Thương Mại Điện Tử Công Nghệ',
  metaDescription: 'Mua sắm các thiết bị công nghệ chính hãng tại TechBite Vietnam.',
  metaKeywords: 'TechBite, E-commerce, Công nghệ',
  metaRobots: 'index, follow',
  ogType: 'website',
};

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  // ─── PRIVATE HELPERS ────────────────────────────────────────────────────────

  /** Load một key từ DB; trả về defaultValue nếu chưa có */
  private async loadKey<T>(key: string, defaultValue: T): Promise<T> {
    const record = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!record) return defaultValue;
    return record.value as T;
  }

  /** Upsert một key vào DB */
  private async saveKey(key: string, value: unknown): Promise<void> {
    await this.prisma.systemSetting.upsert({
      where: { key },
      update: { value: value as any },
      create: { key, value: value as any },
    });
  }

  /** Xóa toàn bộ public caches liên quan settings */
  private async purgePublicCaches(): Promise<void> {
    await Promise.all([
      this.redisService.del(CACHE_PUBLIC_KEY),
      this.redisService.del(CACHE_SEO_KEY),
      this.redisService.del(CACHE_MENUS_KEY),
    ]);
    this.logger.log('Settings public caches purged');
  }

  /** Mask smtpPassword trước khi trả về client */
  private maskEmailSettings(emailSettings: EmailSettings): EmailSettingsResponse {
    const { smtpPassword, ...rest } = emailSettings;
    return {
      ...rest,
      hasPasswordConfigured: !!(smtpPassword && smtpPassword.trim().length > 0),
    };
  }

  // ─── ADMIN: GET ALL ──────────────────────────────────────────────────────────

  async getAllSettings(): Promise<SettingsResponse> {
    try {
      const records = await this.prisma.systemSetting.findMany();
      const map = new Map<string, unknown>();
      records.forEach((r) => map.set(r.key, r.value));

      // Banners
      const banners = await this.prisma.banner.findMany({ orderBy: { order: 'asc' } });
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

      // Email: mask password
      const rawEmail = (map.get('email') ?? {}) as EmailSettings;
      const emailResponse = this.maskEmailSettings(rawEmail);

      const payload: SystemSettingsPayload = {
        general: (map.get('general') as GeneralSettings) ?? DEFAULT_GENERAL,
        payment: (map.get('payment') as PaymentSettings) ?? DEFAULT_PAYMENT,
        shipping: (map.get('shipping') as ShippingSettings) ?? DEFAULT_SHIPPING,
        banners: formattedBanners,
        menus: (map.get('menus') as MenuItemSetting[]) ?? [],
        seo: (map.get('seo') as SeoSocialSettings) ?? DEFAULT_SEO,
        email: emailResponse,
      };

      return { statusCode: 200, message: 'Lấy thông tin thiết lập hệ thống thành công', data: payload };
    } catch (error) {
      this.logger.error('getAllSettings failed', error);
      throw new InternalServerErrorException('Không thể lấy thông tin thiết lập hệ thống');
    }
  }

  // ─── ADMIN: GET SINGLE GROUP ─────────────────────────────────────────────────

  async getGroupSettings(group: string): Promise<{ statusCode: number; message: string; data: unknown }> {
    const allowedGroups = ['general', 'payment', 'shipping', 'menus', 'seo', 'email'];
    if (!allowedGroups.includes(group)) {
      throw new NotFoundException(`Nhóm cấu hình '${group}' không tồn tại`);
    }

    try {
      const record = await this.prisma.systemSetting.findUnique({ where: { key: group } });
      let data: unknown = record?.value ?? null;

      if (group === 'email' && data) {
        data = this.maskEmailSettings(data as EmailSettings);
      }

      return { statusCode: 200, message: `Lấy cấu hình '${group}' thành công`, data };
    } catch (error) {
      this.logger.error(`getGroupSettings(${group}) failed`, error);
      throw new InternalServerErrorException(`Không thể lấy cấu hình nhóm '${group}'`);
    }
  }

  // ─── ADMIN: UPDATE ALL ────────────────────────────────────────────────────────

  async updateSettings(dto: UpdateSystemSettingsDto): Promise<{ statusCode: number; message: string }> {
    try {
      const keysToUpdate: Array<{ key: string; value: unknown }> = [];

      if (dto.general !== undefined) keysToUpdate.push({ key: 'general', value: dto.general });
      if (dto.payment !== undefined) keysToUpdate.push({ key: 'payment', value: dto.payment });
      if (dto.shipping !== undefined) keysToUpdate.push({ key: 'shipping', value: dto.shipping });
      if (dto.menus !== undefined) keysToUpdate.push({ key: 'menus', value: dto.menus });
      if (dto.seo !== undefined) keysToUpdate.push({ key: 'seo', value: dto.seo });

      if (dto.email !== undefined) {
        // Bảo tồn password cũ nếu client gửi empty
        let emailValue = dto.email as EmailSettings;
        if (!emailValue.smtpPassword || emailValue.smtpPassword.trim() === '') {
          const existing = await this.loadKey<EmailSettings>('email', {} as EmailSettings);
          emailValue = { ...emailValue, smtpPassword: existing.smtpPassword };
        }
        keysToUpdate.push({ key: 'email', value: emailValue });
      }

      if (keysToUpdate.length > 0) {
        await this.prisma.$transaction(
          keysToUpdate.map(({ key, value }) =>
            this.prisma.systemSetting.upsert({
              where: { key },
              update: { value: value as any },
              create: { key, value: value as any },
            }),
          ),
        );
      }

      await this.purgePublicCaches();

      return { statusCode: 200, message: 'Cập nhật thiết lập hệ thống thành công' };
    } catch (error) {
      this.logger.error('updateSettings failed', error);
      throw new InternalServerErrorException('Không thể cập nhật thiết lập hệ thống');
    }
  }

  // ─── ADMIN: PATCH SINGLE GROUP ────────────────────────────────────────────────

  async patchGroupSettings(
    group: string,
    value: unknown,
  ): Promise<{ statusCode: number; message: string }> {
    const allowedGroups = ['general', 'payment', 'shipping', 'menus', 'seo', 'email'];
    if (!allowedGroups.includes(group)) {
      throw new NotFoundException(`Nhóm cấu hình '${group}' không tồn tại`);
    }

    try {
      let saveValue = value;

      // Bảo tồn smtpPassword nếu group là email và password để trống
      if (group === 'email') {
        const emailDto = value as EmailSettingsDto;
        if (!emailDto.smtpPassword || emailDto.smtpPassword.trim() === '') {
          const existing = await this.loadKey<EmailSettings>('email', {} as EmailSettings);
          saveValue = { ...emailDto, smtpPassword: existing.smtpPassword };
        }
      }

      await this.saveKey(group, saveValue);
      await this.purgePublicCaches();

      return { statusCode: 200, message: `Cập nhật cấu hình '${group}' thành công` };
    } catch (error) {
      this.logger.error(`patchGroupSettings(${group}) failed`, error);
      throw new InternalServerErrorException(`Không thể cập nhật cấu hình nhóm '${group}'`);
    }
  }

  // ─── ADMIN: TEST SMTP CONNECTION ──────────────────────────────────────────────

  async testEmailConnection(dto: TestEmailConnectionDto): Promise<{ success: boolean; message: string }> {
    try {
      // Ưu tiên customSettings từ form, nếu không dùng settings lưu trong DB
      let config: EmailSettings;
      if (dto.customSettings) {
        // Lấy password cũ nếu custom không kèm password
        if (!dto.customSettings.smtpPassword || dto.customSettings.smtpPassword.trim() === '') {
          const existing = await this.loadKey<EmailSettings>('email', {} as EmailSettings);
          config = { ...(dto.customSettings as EmailSettings), smtpPassword: existing.smtpPassword };
        } else {
          config = dto.customSettings as EmailSettings;
        }
      } else {
        config = await this.loadKey<EmailSettings>('email', {} as EmailSettings);
      }

      if (!config.smtpHost || !config.smtpUser) {
        throw new BadRequestException('Cấu hình SMTP chưa đầy đủ. Vui lòng điền đầy đủ Host, User và Port.');
      }

      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort || 587,
        secure: config.smtpEncryption === 'ssl',
        auth: {
          user: config.smtpUser,
          pass: config.smtpPassword || '',
        },
        ...(config.smtpEncryption === 'tls' ? { requireTLS: true } : {}),
        connectionTimeout: 10000,
        greetingTimeout: 5000,
      });

      await transporter.verify();

      await transporter.sendMail({
        from: `"${config.fromName || 'TechBite'}" <${config.fromEmail || config.smtpUser}>`,
        to: dto.targetEmail,
        subject: '[TechBite] Kiểm tra cấu hình Email SMTP thành công ✅',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #4880FF; margin-bottom: 8px;">✅ Kết nối SMTP thành công!</h2>
            <p style="color: #374151;">Email thử nghiệm này được gửi từ hệ thống <strong>TechBite Admin Dashboard</strong> để xác nhận rằng cấu hình SMTP của bạn đang hoạt động chính xác.</p>
            <hr style="border-color: #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 13px;">SMTP Host: <strong>${config.smtpHost}:${config.smtpPort}</strong> | Mã hóa: <strong>${config.smtpEncryption?.toUpperCase() || 'TLS'}</strong></p>
            <p style="color: #9ca3af; font-size: 12px;">© 2026 TechBite E-Commerce Platform</p>
          </div>
        `,
      });

      return { success: true, message: `Đã gửi email thử nghiệm thành công đến ${dto.targetEmail}` };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`testEmailConnection failed: ${message}`);

      if (error instanceof BadRequestException) throw error;

      throw new BadRequestException(
        `Kết nối SMTP thất bại: ${message}. Vui lòng kiểm tra lại Host, Port, Username và Mật khẩu ứng dụng.`,
      );
    }
  }

  // ─── PUBLIC: GET PUBLIC SETTINGS ─────────────────────────────────────────────

  async getPublicSettings(): Promise<PublicSettingsResponse> {
    try {
      const cached = await this.redisService.get(CACHE_PUBLIC_KEY);
      if (cached) {
        return { statusCode: 200, message: 'Lấy thiết lập công khai thành công (Cache)', data: JSON.parse(cached) };
      }

      const records = await this.prisma.systemSetting.findMany();
      const map = new Map<string, unknown>();
      records.forEach((r) => map.set(r.key, r.value));

      const publicData: Partial<SystemSettingsPayload> = {
        general: (map.get('general') as GeneralSettings) ?? DEFAULT_GENERAL,
        payment: (map.get('payment') as PaymentSettings) ?? DEFAULT_PAYMENT,
        shipping: (map.get('shipping') as ShippingSettings) ?? DEFAULT_SHIPPING,
        menus: ((map.get('menus') as MenuItemSetting[]) ?? []).filter((m) => m.isActive),
        seo: (map.get('seo') as SeoSocialSettings) ?? DEFAULT_SEO,
      };

      await this.redisService.setEx(CACHE_PUBLIC_KEY, CACHE_TTL, JSON.stringify(publicData));

      return { statusCode: 200, message: 'Lấy thiết lập công khai thành công', data: publicData };
    } catch (error) {
      this.logger.error('getPublicSettings failed', error);
      throw new InternalServerErrorException('Không thể lấy thông tin cấu hình công khai');
    }
  }

  // ─── PUBLIC: GET SEO METADATA ──────────────────────────────────────────────

  async getPublicSeoSettings(): Promise<{ statusCode: number; message: string; data: SeoSocialSettings }> {
    try {
      const cached = await this.redisService.get(CACHE_SEO_KEY);
      if (cached) {
        return { statusCode: 200, message: 'Lấy cấu hình SEO thành công (Cache)', data: JSON.parse(cached) };
      }

      const seo = await this.loadKey<SeoSocialSettings>('seo', DEFAULT_SEO);

      await this.redisService.setEx(CACHE_SEO_KEY, CACHE_TTL, JSON.stringify(seo));

      return { statusCode: 200, message: 'Lấy cấu hình SEO thành công', data: seo };
    } catch (error) {
      this.logger.error('getPublicSeoSettings failed', error);
      throw new InternalServerErrorException('Không thể lấy cấu hình SEO');
    }
  }

  // ─── PUBLIC: GET NAVIGATION MENUS ────────────────────────────────────────────

  async getPublicMenus(): Promise<{ statusCode: number; message: string; data: MenuItemSetting[] }> {
    try {
      const cached = await this.redisService.get(CACHE_MENUS_KEY);
      if (cached) {
        return { statusCode: 200, message: 'Lấy navigation menus thành công (Cache)', data: JSON.parse(cached) };
      }

      const allMenus = await this.loadKey<MenuItemSetting[]>('menus', []);
      const activeMenus = allMenus.filter((m) => m.isActive);

      await this.redisService.setEx(CACHE_MENUS_KEY, CACHE_TTL, JSON.stringify(activeMenus));

      return { statusCode: 200, message: 'Lấy navigation menus thành công', data: activeMenus };
    } catch (error) {
      this.logger.error('getPublicMenus failed', error);
      throw new InternalServerErrorException('Không thể lấy danh sách navigation menus');
    }
  }

  // ─── UTIL: Đọc cấu hình email cho MailService dynamic transporter ─────────────

  async getEmailConfig(): Promise<EmailSettings | null> {
    const config = await this.loadKey<EmailSettings>('email', {} as EmailSettings);
    if (!config.smtpHost) return null;
    return config;
  }

  async clearPublicCache(): Promise<void> {
    await this.purgePublicCaches();
  }
}
