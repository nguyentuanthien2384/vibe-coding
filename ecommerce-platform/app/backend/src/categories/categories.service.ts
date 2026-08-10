import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { CategoryResponseItem, CategoriesResponse } from './interfaces/category-response.interface';
import { CACHE_CONFIG } from '../config/cache.constants';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private cache: { data: CategoryResponseItem[]; expiresAt: number } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: GetCategoriesDto): Promise<CategoriesResponse> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      this.logger.debug(`Cache HIT: ${CACHE_CONFIG.CATEGORIES.KEYS.ALL}`);
      const data = dto.tree ? this.buildTree(this.cache.data) : this.cache.data;
      return {
        statusCode: 200,
        message: 'Lấy danh sách danh mục thành công',
        data,
      };
    }

    try {
      const categories = await this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          iconUrl: true,
          parentId: true,
          position: true,
        },
      });

      // Flatten list (with empty children for now)
      const flatList: CategoryResponseItem[] = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        iconUrl: c.iconUrl,
        position: c.position,
        parentId: c.parentId,
        children: [],
      })) as (CategoryResponseItem & { parentId: number | null })[];

      this.cache = {
        data: flatList,
        expiresAt: Date.now() + CACHE_CONFIG.CATEGORIES.TTL.ALL * 1000,
      };

      const data = dto.tree ? this.buildTree(flatList) : flatList;

      return {
        statusCode: 200,
        message: 'Lấy danh sách danh mục thành công',
        data,
      };
    } catch (error) {
      this.logger.error('Failed to fetch categories', error);
      throw new InternalServerErrorException('Không thể lấy danh sách danh mục');
    }
  }

  private buildTree(flatList: (CategoryResponseItem & { parentId?: number | null })[]): CategoryResponseItem[] {
    const map = new Map<number, CategoryResponseItem & { parentId?: number | null }>();
    for (const item of flatList) {
      map.set(item.id, { ...item, children: [] });
    }

    const roots: CategoryResponseItem[] = [];
    for (const item of map.values()) {
      if (item.parentId) {
        const parent = map.get(item.parentId);
        parent?.children.push(item);
      } else {
        roots.push(item);
      }
    }
    return roots;
  }

  /**
   * Invalidates category cache. Called when admin updates category data.
   */
  invalidateCache(): void {
    this.cache = null;
    this.logger.log('Category cache invalidated');
  }
}
