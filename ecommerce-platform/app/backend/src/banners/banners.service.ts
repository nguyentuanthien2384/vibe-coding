import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { GetBannersDto } from './dto/get-banners.dto';
import { GetBannersAdminDto } from './dto/get-banners-admin.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ReorderBannersDto } from './dto/reorder-banners.dto';
import {
  AdminBannerMutateResponse,
  BannerResponseItem,
  BannersResponse,
} from './interfaces/banner-response.interface';
import { BannerCategory, BannerPosition, BannerType, Prisma } from '@prisma/client';
import { CACHE_CONFIG } from '../config/cache.constants';

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);
  private readonly cache = new Map<string, { data: BannerResponseItem[]; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Public API: Lấy danh sách banner active phục vụ Storefront Frontend
   */
  async findAll(dto: GetBannersDto): Promise<BannersResponse> {
    const cacheKey = `banners:${dto.category ?? 'ALL'}:${dto.position ?? 'ALL'}:${dto.type ?? 'ALL'}`;

    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return {
        statusCode: 200,
        message: 'Lấy danh sách banner thành công',
        data: cached.data,
      };
    }

    try {
      const where: Prisma.BannerWhereInput = { isActive: true };

      if (dto.category) {
        where.category = dto.category;
      }

      if (dto.position) {
        where.bannerPosition = dto.position;
      } else if (dto.type) {
        if (dto.type === BannerType.HERO_BANNER) {
          where.OR = [
            { bannerPosition: BannerPosition.HERO_BANNER },
            { category: BannerCategory.HOME },
            { type: BannerType.HERO_BANNER },
          ];
        } else if (dto.type === BannerType.PROMOTION_BANNER) {
          where.OR = [
            { bannerPosition: BannerPosition.PROMOTION_BANNER },
            { category: BannerCategory.PRODUCT },
            { type: BannerType.PROMOTION_BANNER },
          ];
        }
      }

      const banners = await this.prisma.banner.findMany({
        where,
        orderBy: [{ order: 'asc' }, { id: 'desc' }],
      });

      const data: BannerResponseItem[] = banners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.imageUrl,
        linkUrl: b.linkUrl,
        category: b.category,
        bannerPosition: b.bannerPosition,
        type: b.type,
        position: b.position,
        order: b.order,
        isActive: b.isActive,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));

      this.cache.set(cacheKey, {
        data,
        expiresAt: Date.now() + CACHE_CONFIG.BANNERS.TTL.LIST * 1000,
      });

      return {
        statusCode: 200,
        message: 'Lấy danh sách banner thành công',
        data,
      };
    } catch (error) {
      this.logger.error('Failed to fetch banners', error);
      throw new InternalServerErrorException('Không thể lấy danh sách banner');
    }
  }

  /**
   * Admin API: Lấy toàn bộ danh sách Banner (bao gồm inactive) cho Admin Dashboard
   */
  async findAllAdmin(dto: GetBannersAdminDto): Promise<BannersResponse> {
    try {
      const where: Prisma.BannerWhereInput = {};

      if (dto.category) {
        where.category = dto.category;
      }
      if (dto.position) {
        where.bannerPosition = dto.position;
      }
      if (dto.search) {
        where.title = { contains: dto.search.trim() };
      }

      const banners = await this.prisma.banner.findMany({
        where,
        orderBy: [{ order: 'asc' }, { id: 'desc' }],
      });

      const data: BannerResponseItem[] = banners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.imageUrl,
        linkUrl: b.linkUrl,
        category: b.category,
        bannerPosition: b.bannerPosition,
        type: b.type,
        position: b.position,
        order: b.order,
        isActive: b.isActive,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));

      return {
        statusCode: 200,
        message: 'Lấy danh sách banner quản trị thành công',
        data,
      };
    } catch (error) {
      this.logger.error('Failed to fetch admin banners', error);
      throw new InternalServerErrorException('Không thể lấy danh sách banner quản trị');
    }
  }

  /**
   * Admin API: Tạo mới một Banner
   */
  async createBanner(dto: CreateBannerDto): Promise<AdminBannerMutateResponse> {
    try {
      const category = dto.category ?? BannerCategory.HOME;
      const bannerPosition = dto.position ?? BannerPosition.HERO_BANNER;
      const type =
        dto.type ??
        (bannerPosition === BannerPosition.PROMOTION_BANNER
          ? BannerType.PROMOTION_BANNER
          : BannerType.HERO_BANNER);

      // Tính toán vị trí order tiếp theo nếu không truyền
      let order = dto.order;
      if (order === undefined) {
        const maxBanner = await this.prisma.banner.findFirst({
          where: { category, bannerPosition },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        order = (maxBanner?.order ?? 0) + 1;
      }

      const banner = await this.prisma.banner.create({
        data: {
          title: dto.title.trim(),
          subtitle: dto.subtitle?.trim(),
          imageUrl: dto.imageUrl.trim(),
          linkUrl: dto.targetUrl?.trim(),
          category,
          bannerPosition,
          type,
          order,
          position: order,
          isActive: dto.isActive ?? true,
        },
      });

      this.invalidateCache();

      return {
        statusCode: 201,
        message: 'Tạo banner thành công',
        data: {
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl,
          category: banner.category,
          bannerPosition: banner.bannerPosition,
          type: banner.type,
          position: banner.position,
          order: banner.order,
          isActive: banner.isActive,
          createdAt: banner.createdAt,
          updatedAt: banner.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error('Failed to create banner', error);
      throw new InternalServerErrorException('Không thể tạo banner mới');
    }
  }

  /**
   * Admin API: Cập nhật thông tin Banner
   */
  async updateBanner(id: number, dto: UpdateBannerDto): Promise<AdminBannerMutateResponse> {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy Banner với ID ${id}`);
    }

    try {
      const oldImageUrl = existing.imageUrl;
      const newPosition = dto.position ?? existing.bannerPosition;
      const newType =
        dto.type ??
        (newPosition === BannerPosition.PROMOTION_BANNER
          ? BannerType.PROMOTION_BANNER
          : BannerType.HERO_BANNER);

      const banner = await this.prisma.banner.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title.trim() }),
          ...(dto.subtitle !== undefined && { subtitle: dto.subtitle?.trim() }),
          ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl.trim() }),
          ...(dto.targetUrl !== undefined && { linkUrl: dto.targetUrl?.trim() }),
          ...(dto.category !== undefined && { category: dto.category }),
          ...(dto.position !== undefined && { bannerPosition: dto.position }),
          type: newType,
          ...(dto.order !== undefined && { order: dto.order, position: dto.order }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });

      // Nếu thay đổi ảnh mới -> tự động dọn dẹp ảnh cũ nếu không dùng ở đâu khác
      if (dto.imageUrl && dto.imageUrl !== oldImageUrl) {
        await this.uploadService.deleteImageFile(oldImageUrl);
      }

      this.invalidateCache();

      return {
        statusCode: 200,
        message: 'Cập nhật banner thành công',
        data: {
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl,
          category: banner.category,
          bannerPosition: banner.bannerPosition,
          type: banner.type,
          position: banner.position,
          order: banner.order,
          isActive: banner.isActive,
          createdAt: banner.createdAt,
          updatedAt: banner.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to update banner #${id}`, error);
      throw new InternalServerErrorException('Không thể cập nhật thông tin banner');
    }
  }

  /**
   * Admin API: Xóa Banner và xóa file ảnh vật lý trên ổ đĩa
   */
  async deleteBanner(id: number): Promise<{ statusCode: number; message: string }> {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy Banner với ID ${id}`);
    }

    try {
      const imageUrl = existing.imageUrl;

      await this.prisma.banner.delete({ where: { id } });

      // Xóa tập tin hình ảnh thực tế trên đĩa server nếu có
      await this.uploadService.deleteImageFile(imageUrl);

      this.invalidateCache();

      return {
        statusCode: 200,
        message: 'Xóa banner thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to delete banner #${id}`, error);
      throw new InternalServerErrorException('Không thể xóa banner');
    }
  }

  /**
   * Admin API: Cập nhật thứ tự Banners hàng loạt (Reorder)
   */
  async reorderBanners(dto: ReorderBannersDto): Promise<{ statusCode: number; message: string }> {
    try {
      await this.prisma.$transaction(
        dto.items.map((item) =>
          this.prisma.banner.update({
            where: { id: item.id },
            data: { order: item.order, position: item.order },
          }),
        ),
      );

      this.invalidateCache();

      return {
        statusCode: 200,
        message: 'Cập nhật thứ tự banner thành công',
      };
    } catch (error) {
      this.logger.error('Failed to reorder banners', error);
      throw new InternalServerErrorException('Không thể sắp xếp lại thứ tự banner');
    }
  }

  /**
   * Clear in-memory cache
   */
  invalidateCache(): void {
    this.cache.clear();
    this.logger.log('Banner in-memory cache cleared');
  }
}
