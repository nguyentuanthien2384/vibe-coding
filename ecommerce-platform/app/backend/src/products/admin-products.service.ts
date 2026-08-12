import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CACHE_CONFIG } from '../config/cache.constants';
import {
  GetAdminProductsDto,
  ProductSortBy,
  ProductStatusFilter,
  SortOrder,
  StockStatusFilter,
} from './dto/get-admin-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  AdminProductDetailResponse,
  AdminProductDeleteResponse,
  AdminProductItem,
  AdminProductListResponse,
  AdminProductMutateResponse,
  ProductGalleryItem,
} from './interfaces/admin-product.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminProductsService {
  private readonly logger = new Logger(AdminProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ============================================================
  // GET LIST
  // ============================================================
  async findAll(dto: GetAdminProductsDto): Promise<AdminProductListResponse> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (dto.search?.trim()) {
      const search = dto.search.trim();
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (dto.categoryId) {
      where.categoryId = dto.categoryId;
    }

    if (dto.status === ProductStatusFilter.ACTIVE) {
      where.isActive = true;
    } else if (dto.status === ProductStatusFilter.INACTIVE) {
      where.isActive = false;
    }

    if (dto.stockStatus === StockStatusFilter.IN_STOCK) {
      where.stock = { gt: 0 };
    } else if (dto.stockStatus === StockStatusFilter.OUT_OF_STOCK) {
      where.stock = 0;
    }

    if (typeof dto.isFeatured === 'boolean') {
      where.isFeatured = dto.isFeatured;
    }

    const sortBy = dto.sortBy ?? ProductSortBy.CREATED_AT;
    const sortOrder = dto.sortOrder ?? SortOrder.DESC;
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    try {
      const [products, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      const data: AdminProductItem[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        stock: p.stock,
        imageUrl: p.imageUrl,
        images: this.parseGalleryImages(p.images),
        categoryId: p.categoryId,
        categoryName: p.category.name,
        categorySlug: p.category.slug,
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        shortDescription: p.shortDescription as Record<string, any> | null,
        longDescription: p.longDescription as Record<string, any> | null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      return {
        statusCode: 200,
        message: 'Lấy danh sách sản phẩm thành công',
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch admin products', error);
      throw new InternalServerErrorException('Không thể lấy danh sách sản phẩm');
    }
  }

  // ============================================================
  // GET DETAIL
  // ============================================================
  async findOne(id: number): Promise<AdminProductDetailResponse> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm với ID = ${id}`);
      }

      return {
        statusCode: 200,
        message: 'Lấy thông tin chi tiết sản phẩm thành công',
        data: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          stock: product.stock,
          imageUrl: product.imageUrl,
          images: this.parseGalleryImages(product.images),
          categoryId: product.categoryId,
          category: product.category,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          shortDescription: product.shortDescription as Record<string, any> | null,
          longDescription: product.longDescription as Record<string, any> | null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to fetch product id=${id}`, error);
      throw new InternalServerErrorException('Không thể lấy thông tin sản phẩm');
    }
  }

  // ============================================================
  // CREATE
  // ============================================================
  async create(dto: CreateProductDto): Promise<AdminProductMutateResponse> {
    const slug = dto.slug?.trim() || this.generateSlug(dto.name);

    // Check slug unique
    const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException(`Slug '${slug}' đã tồn tại trong hệ thống`);
    }

    // Check category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException(`Chuyên mục (id = ${dto.categoryId}) không tồn tại`);
    }

    // Validate salePrice < price
    if (dto.salePrice != null && dto.salePrice >= dto.price) {
      throw new BadRequestException('Giá khuyến mãi phải nhỏ hơn giá gốc của sản phẩm');
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name,
          slug,
          price: dto.price,
          salePrice: dto.salePrice ?? null,
          stock: dto.stock,
          imageUrl: dto.imageUrl,
          images: this.formatGalleryImages(dto.images),
          categoryId: dto.categoryId,
          isFeatured: dto.isFeatured ?? false,
          isActive: dto.isActive ?? true,
          shortDescription: (dto.shortDescription as any) ?? Prisma.JsonNull,
          longDescription: (dto.longDescription as any) ?? Prisma.JsonNull,
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      await this.invalidatePublicCache();

      const data: AdminProductItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        stock: product.stock,
        imageUrl: product.imageUrl,
        images: this.parseGalleryImages(product.images),
        categoryId: product.categoryId,
        categoryName: product.category.name,
        categorySlug: product.category.slug,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        shortDescription: product.shortDescription as Record<string, any> | null,
        longDescription: product.longDescription as Record<string, any> | null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      return {
        statusCode: 201,
        message: 'Tạo mới sản phẩm thành công',
        data,
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) throw error;
      this.logger.error('Failed to create product', error);
      throw new InternalServerErrorException('Không thể tạo mới sản phẩm');
    }
  }

  // ============================================================
  // UPDATE
  // ============================================================
  async update(id: number, dto: UpdateProductDto): Promise<AdminProductMutateResponse> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID = ${id}`);
    }

    // Check slug conflict if updated
    if (dto.slug && dto.slug !== existing.slug) {
      const slugConflict = await this.prisma.product.findUnique({ where: { slug: dto.slug } });
      if (slugConflict) {
        throw new ConflictException(`Slug '${dto.slug}' đã tồn tại trong hệ thống`);
      }
    }

    // Check category exists if updated
    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) {
        throw new BadRequestException(`Chuyên mục (id = ${dto.categoryId}) không tồn tại`);
      }
    }

    // Check price & salePrice validation
    const targetPrice = dto.price !== undefined ? dto.price : Number(existing.price);
    const targetSalePrice =
      dto.salePrice !== undefined
        ? dto.salePrice
        : existing.salePrice
          ? Number(existing.salePrice)
          : null;

    if (targetSalePrice != null && targetSalePrice >= targetPrice) {
      throw new BadRequestException('Giá khuyến mãi phải nhỏ hơn giá gốc của sản phẩm');
    }

    try {
      const updated = await this.prisma.product.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.slug !== undefined && { slug: dto.slug }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.salePrice !== undefined && { salePrice: dto.salePrice }),
          ...(dto.stock !== undefined && { stock: dto.stock }),
          ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
          ...(dto.images !== undefined && { images: this.formatGalleryImages(dto.images) }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.shortDescription !== undefined && {
            shortDescription: (dto.shortDescription as any) ?? Prisma.JsonNull,
          }),
          ...(dto.longDescription !== undefined && {
            longDescription: (dto.longDescription as any) ?? Prisma.JsonNull,
          }),
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      await this.invalidatePublicCache();

      const data: AdminProductItem = {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        price: Number(updated.price),
        salePrice: updated.salePrice ? Number(updated.salePrice) : null,
        stock: updated.stock,
        imageUrl: updated.imageUrl,
        images: this.parseGalleryImages(updated.images),
        categoryId: updated.categoryId,
        categoryName: updated.category.name,
        categorySlug: updated.category.slug,
        isFeatured: updated.isFeatured,
        isActive: updated.isActive,
        shortDescription: updated.shortDescription as Record<string, any> | null,
        longDescription: updated.longDescription as Record<string, any> | null,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };

      return {
        statusCode: 200,
        message: 'Cập nhật sản phẩm thành công',
        data,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(`Failed to update product id=${id}`, error);
      throw new InternalServerErrorException('Không thể cập nhật sản phẩm');
    }
  }

  // ============================================================
  // DELETE (WITH SAFETY CHECK)
  // ============================================================
  async remove(id: number): Promise<AdminProductDeleteResponse> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID = ${id}`);
    }

    // Safety Check: Kiểm tra sản phẩm đã từng phát sinh trong đơn hàng chưa
    const orderItemCount = await this.prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      throw new BadRequestException(
        `Không thể xóa sản phẩm '${product.name}' vì đã có ${orderItemCount} đơn hàng liên quan. Vui lòng chuyển trạng thái sang Tạm ẩn (INACTIVE) để bảo toàn lịch sử hóa đơn.`,
      );
    }

    try {
      await this.prisma.product.delete({ where: { id } });
      await this.invalidatePublicCache();

      return {
        statusCode: 200,
        message: 'Xóa vĩnh viễn sản phẩm thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to delete product id=${id}`, error);
      throw new InternalServerErrorException('Không thể xóa sản phẩm');
    }
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private formatGalleryImages(imagesInput: any): Prisma.InputJsonValue {
    if (!imagesInput || !Array.isArray(imagesInput) || imagesInput.length === 0) {
      return null as any;
    }
    const formatted = imagesInput
      .map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return { url: item, position: idx + 1 };
        }
        return {
          url: item?.url || '',
          position: typeof item?.position === 'number' ? item.position : idx + 1,
        };
      })
      .filter((item: any) => Boolean(item.url));

    return formatted.length > 0 ? (formatted as any) : (null as any);
  }

  private parseGalleryImages(imagesJson: any): ProductGalleryItem[] | null {
    if (!imagesJson || !Array.isArray(imagesJson)) return null;
    return imagesJson
      .map((item: any, idx: number) => ({
        url: typeof item === 'string' ? item : item?.url || '',
        position: typeof item?.position === 'number' ? item.position : idx + 1,
      }))
      .filter((item: any) => Boolean(item.url));
  }

  private async invalidatePublicCache(): Promise<void> {
    try {
      await this.redis.delByPattern('cache:v1:products:*');
      await this.redis.delByPattern(CACHE_CONFIG.CATEGORIES.PREFIXES.ALL + '*');
      this.logger.log('✅ Đã xóa cache public products & categories sau thao tác admin');
    } catch (error) {
      this.logger.warn(`⚠️ Không thể xóa cache products: ${error.message}`);
    }
  }
}
