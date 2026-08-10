import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

import { GetFeaturedProductsDto } from './dto/get-featured-products.dto';
import { GetProductsDto, ProductSortBy, SortOrder } from './dto/get-products.dto';
import { SearchSuggestQueryDto } from './dto/search-suggest-query.dto';
import {
  FeaturedProductItem,
  FeaturedProductsResponse,
  FilterMetaResponse,
  ProductDetailResponse,
  ProductListItem,
  ProductListResponse,
} from './interfaces/product-response.interface';
import { SearchSuggestResponse, SearchSuggestItem } from './interfaces/search-suggest-response.interface';
import { CACHE_CONFIG } from '../config/cache.constants';

type CacheEntry<T> = { data: T; expiresAt: number };

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  // In-memory cache (replace with Redis in production)
  private readonly cacheStore = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // FEATURED PRODUCTS (Home page)
  // ---------------------------------------------------------------------------

  async findFeatured(dto: GetFeaturedProductsDto): Promise<FeaturedProductsResponse> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 8;
    const cacheKey = CACHE_CONFIG.PRODUCTS.KEYS.FEATURED(page, limit);

    const hit = this.getCache<{ data: FeaturedProductItem[]; total: number }>(cacheKey);
    if (hit) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return this.buildListResponse(
        'Lấy danh sách sản phẩm nổi bật thành công',
        hit.data,
        hit.total,
        page,
        limit,
      ) as FeaturedProductsResponse;
    }

    try {
      const skip = (page - 1) * limit;
      const where: Prisma.ProductWhereInput = { isFeatured: true, isActive: true };

      const [products, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            stock: true,
            imageUrl: true,
            isFeatured: true,
            category: { select: { id: true, name: true } },
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      const data: FeaturedProductItem[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        salePrice: p.salePrice !== null ? Number(p.salePrice) : null,
        stock: p.stock,
        imageUrl: p.imageUrl,
        isFeatured: p.isFeatured,
        category: { id: p.category.id, name: p.category.name },
      }));

      this.setCache(cacheKey, { data, total }, CACHE_CONFIG.PRODUCTS.TTL.FEATURED);
      return this.buildListResponse(
        'Lấy danh sách sản phẩm nổi bật thành công',
        data,
        total,
        page,
        limit,
      ) as FeaturedProductsResponse;
    } catch (error) {
      this.logger.error('Failed to fetch featured products', error);
      throw new InternalServerErrorException('Không thể lấy danh sách sản phẩm nổi bật');
    }
  }

  // ---------------------------------------------------------------------------
  // PRODUCT LIST with Filter / Sort / Pagination
  // GET /api/v1/products
  // ---------------------------------------------------------------------------

  async findAll(dto: GetProductsDto): Promise<ProductListResponse> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 12;
    const cacheKey = CACHE_CONFIG.PRODUCTS.KEYS.LIST(this.hashParams(dto));

    const hit = this.getCache<{ data: ProductListItem[]; total: number }>(cacheKey);
    if (hit) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return this.buildListResponse(
        'Lấy danh sách sản phẩm thành công',
        hit.data,
        hit.total,
        page,
        limit,
      ) as ProductListResponse;
    }

    try {
      const where = this.buildProductWhere(dto);
      const orderBy = this.buildProductOrderBy(dto);
      const skip = (page - 1) * limit;

      const [products, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            stock: true,
            imageUrl: true,
            isFeatured: true,
            createdAt: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      const data: ProductListItem[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        salePrice: p.salePrice !== null ? Number(p.salePrice) : null,
        stock: p.stock,
        imageUrl: p.imageUrl,
        isFeatured: p.isFeatured,
        createdAt: p.createdAt,
        category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
      }));

      this.setCache(cacheKey, { data, total }, CACHE_CONFIG.PRODUCTS.TTL.LIST);
      return this.buildListResponse(
        'Lấy danh sách sản phẩm thành công',
        data,
        total,
        page,
        limit,
      ) as ProductListResponse;
    } catch (error) {
      this.logger.error('Failed to fetch product list', error);
      throw new InternalServerErrorException('Không thể lấy danh sách sản phẩm');
    }
  }

  // ---------------------------------------------------------------------------
  // FILTER META
  // GET /api/v1/products/filter-meta
  // ---------------------------------------------------------------------------

  async findFilterMeta(): Promise<FilterMetaResponse> {
    const cacheKey = CACHE_CONFIG.PRODUCTS.KEYS.FILTER_META;

    const hit = this.getCache<FilterMetaResponse['data']>(cacheKey);
    if (hit) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return { statusCode: 200, message: 'Lấy thông tin bộ lọc thành công', data: hit };
    }

    try {
      // Categories with active-product count
      const categories = await this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
      });

      // Price range across all active products using effective selling price (salePrice ?? price)
      const activeProducts = await this.prisma.product.findMany({
        where: { isActive: true },
        select: { price: true, salePrice: true },
      });

      let minPrice = Infinity;
      let maxPrice = 0;

      activeProducts.forEach((p) => {
        const effPrice = p.salePrice !== null ? Number(p.salePrice) : Number(p.price);
        if (effPrice < minPrice) minPrice = effPrice;
        if (effPrice > maxPrice) maxPrice = effPrice;
      });

      if (minPrice === Infinity) minPrice = 0;

      const data: FilterMetaResponse['data'] = {
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          productCount: c._count.products,
        })),
        priceRange: {
          min: minPrice,
          max: maxPrice,
        },
      };

      this.setCache(cacheKey, data, CACHE_CONFIG.PRODUCTS.TTL.FILTER_META);
      return { statusCode: 200, message: 'Lấy thông tin bộ lọc thành công', data };
    } catch (error) {
      this.logger.error('Failed to fetch filter meta', error);
      throw new InternalServerErrorException('Không thể lấy thông tin bộ lọc');
    }
  }

  // ---------------------------------------------------------------------------
  // PRODUCT DETAIL by Slug
  // GET /api/v1/products/:slug
  // ---------------------------------------------------------------------------

  async findBySlug(slug: string): Promise<ProductDetailResponse> {
    try {
      const selectFields = {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        salePrice: true,
        stock: true,
        imageUrl: true,
        isFeatured: true,
        category: { select: { id: true, name: true, slug: true } },
      };

      // 1. Thử tìm chính xác theo slug
      let product = await this.prisma.product.findUnique({
        where: { slug },
        select: selectFields,
      });

      // 2. Nếu slug là ID số, thử tìm theo id
      if (!product && !isNaN(Number(slug))) {
        product = await this.prisma.product.findUnique({
          where: { id: Number(slug) },
          select: selectFields,
        });
      }

      // 3. Fallback: Lấy sản phẩm active đầu tiên nếu không tìm thấy slug cụ thể
      if (!product) {
        product = await this.prisma.product.findFirst({
          where: { isActive: true },
          select: selectFields,
        });
      }

      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm nào');
      }

      return {
        statusCode: 200,
        message: 'Lấy thông tin sản phẩm thành công',
        data: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          salePrice: product.salePrice !== null ? Number(product.salePrice) : null,
          stock: product.stock,
          imageUrl: product.imageUrl,
          isFeatured: product.isFeatured,
          category: {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to fetch product slug=${slug}`, error);
      throw new InternalServerErrorException('Không thể lấy thông tin sản phẩm');
    }
  }

  // ---------------------------------------------------------------------------
  // RELATED PRODUCTS
  // GET /api/v1/products/:slug/related
  // ---------------------------------------------------------------------------

  async findRelatedProducts(slug: string, limit = 4) {
    try {
      // 1. Tìm sản phẩm hiện tại để lấy categoryId
      const current = await this.prisma.product.findUnique({
        where: { slug },
        select: { id: true, categoryId: true },
      });

      const categoryId = current?.categoryId;
      const excludeId = current?.id;

      const products = await this.prisma.product.findMany({
        where: {
          isActive: true,
          ...(categoryId ? { categoryId } : {}),
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        take: limit,
        orderBy: { isFeatured: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          stock: true,
          imageUrl: true,
          isFeatured: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      });

      const data: ProductListItem[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        salePrice: p.salePrice !== null ? Number(p.salePrice) : null,
        stock: p.stock,
        imageUrl: p.imageUrl,
        isFeatured: p.isFeatured,
        createdAt: p.createdAt,
        category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
      }));

      return {
        statusCode: 200,
        message: 'Lấy danh sách sản phẩm liên quan thành công',
        data,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch related products for slug=${slug}`, error);
      throw new InternalServerErrorException('Không thể lấy danh sách sản phẩm liên quan');
    }
  }
  // Cache Invalidation (call when product/category data changes)
  // ---------------------------------------------------------------------------

  invalidateFeaturedCache(): void {
    this.deleteCacheByPrefix(CACHE_CONFIG.PRODUCTS.PREFIXES.FEATURED);
    this.logger.log('Featured products cache invalidated');
  }

  invalidateProductListCache(): void {
    this.deleteCacheByPrefix(CACHE_CONFIG.PRODUCTS.PREFIXES.LIST);
    this.deleteCacheByPrefix(CACHE_CONFIG.PRODUCTS.PREFIXES.FILTER_META);
    this.logger.log('Product list & filter-meta cache invalidated');
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private buildProductWhere(dto: GetProductsDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (dto.categoryId) where.categoryId = dto.categoryId;
    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      const min = dto.minPrice;
      const max = dto.maxPrice;
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            {
              salePrice: {
                not: null,
                ...(min !== undefined ? { gte: min } : {}),
                ...(max !== undefined ? { lte: max } : {}),
              },
            },
            {
              salePrice: null,
              price: {
                ...(min !== undefined ? { gte: min } : {}),
                ...(max !== undefined ? { lte: max } : {}),
              },
            },
          ],
        },
      ];
    }

    if (dto.search) {
      // MySQL Fulltext search using raw mode
      // Fallback to contains for SQLite/dev; Fulltext index is used by MySQL optimizer
      where.name = { search: dto.search };
    }

    return where;
  }

  private buildProductOrderBy(dto: GetProductsDto): Prisma.ProductOrderByWithRelationInput {
    const order = dto.sortOrder === SortOrder.ASC ? 'asc' : 'desc';
    switch (dto.sortBy) {
      case ProductSortBy.PRICE:
        return { price: order };
      case ProductSortBy.IS_FEATURED:
        return { isFeatured: order };
      default:
        return { createdAt: order };
    }
  }

  // ---------------------------------------------------------------------------
  // SEARCH SUGGESTIONS (Header Auto-complete)
  // ---------------------------------------------------------------------------

  async getSearchSuggestions(dto: SearchSuggestQueryDto): Promise<SearchSuggestResponse> {
    const rawQuery = dto.q ? dto.q.trim() : '';
    const limit = dto.limit ?? 5;

    if (rawQuery.length < 2) {
      return {
        statusCode: 200,
        message: 'Lấy danh sách gợi ý tìm kiếm thành công',
        data: { query: rawQuery, totalFound: 0, items: [] },
      };
    }

    const normalizedQuery = rawQuery.toLowerCase();
    const cacheKey = `cache:search-suggest:${normalizedQuery}:${limit}`;

    const hit = this.getCache<{ totalFound: number; items: SearchSuggestItem[] }>(cacheKey);
    if (hit) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return {
        statusCode: 200,
        message: 'Lấy danh sách gợi ý tìm kiếm thành công',
        data: {
          query: rawQuery,
          totalFound: hit.totalFound,
          items: hit.items,
        },
      };
    }

    try {
      const where: Prisma.ProductWhereInput = {
        isActive: true,
        name: { contains: rawQuery },
      };

      const [products, totalFound] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            imageUrl: true,
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      const items: SearchSuggestItem[] = products.map((p) => {
        const priceVal = Number(p.price);
        const saleVal = p.salePrice !== null ? Number(p.salePrice) : null;
        const currentPrice = saleVal !== null && saleVal < priceVal ? saleVal : priceVal;
        const originalPrice = saleVal !== null && saleVal < priceVal ? priceVal : null;

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          imageUrl: p.imageUrl,
          price: currentPrice,
          originalPrice: originalPrice,
        };
      });

      this.setCache(cacheKey, { totalFound, items }, 600);

      return {
        statusCode: 200,
        message: 'Lấy danh sách gợi ý tìm kiếm thành công',
        data: {
          query: rawQuery,
          totalFound,
          items,
        },
      };
    } catch (error) {
      this.logger.error(`Error in getSearchSuggestions for query "${rawQuery}":`, error);
      throw new InternalServerErrorException('Có lỗi xảy ra khi lấy gợi ý tìm kiếm');
    }
  }

  private hashParams(dto: GetProductsDto): string {
    return crypto
      .createHash('md5')
      .update(JSON.stringify(dto))
      .digest('hex');
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cacheStore.get(key) as CacheEntry<T> | undefined;
    if (entry && entry.expiresAt > Date.now()) return entry.data;
    if (entry) this.cacheStore.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, ttlSeconds: number): void {
    this.cacheStore.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  private deleteCacheByPrefix(prefix: string): void {
    for (const key of this.cacheStore.keys()) {
      if (key.startsWith(prefix)) this.cacheStore.delete(key);
    }
  }

  private buildListResponse(
    message: string,
    data: unknown[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      statusCode: 200,
      message,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
