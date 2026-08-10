import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetBannersDto } from './dto/get-banners.dto';
import { BannerResponseItem, BannersResponse } from './interfaces/banner-response.interface';
import { BannerType } from '@prisma/client';
import { CACHE_CONFIG } from '../config/cache.constants';

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);
  private readonly cache = new Map<string, { data: BannerResponseItem[]; expiresAt: number }>();

  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: GetBannersDto): Promise<BannersResponse> {
    const cacheKey = CACHE_CONFIG.BANNERS.KEYS.BY_TYPE(dto.type ?? 'ALL');

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
      const where: { isActive: boolean; type?: BannerType } = { isActive: true };
      if (dto.type) {
        where.type = dto.type;
      }

      const banners = await this.prisma.banner.findMany({
        where,
        orderBy: { position: 'asc' },
        select: {
          id: true,
          title: true,
          subtitle: true,
          imageUrl: true,
          linkUrl: true,
          type: true,
          position: true,
        },
      });

      const data: BannerResponseItem[] = banners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.imageUrl,
        linkUrl: b.linkUrl,
        type: b.type,
        position: b.position,
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
   * Invalidates banner cache. Called when admin updates banner data.
   */
  invalidateCache(type?: BannerType): void {
    if (type) {
      this.cache.delete(CACHE_CONFIG.BANNERS.KEYS.BY_TYPE(type));
    } else {
      // Invalidate all banner cache keys
      for (const key of this.cache.keys()) {
        if (key.startsWith(CACHE_CONFIG.BANNERS.PREFIXES.ALL)) {
          this.cache.delete(key);
        }
      }
    }
    this.logger.log(`Banner cache invalidated (type: ${type ?? 'ALL'})`);
  }
}
