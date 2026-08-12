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
import { GetAdminCategoriesDto } from './dto/get-admin-categories.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  AdminCategoryItem,
  AdminCategoryDetail,
  AdminCategoryCreated,
  AdminCategoriesListResponse,
  AdminCategoryDetailResponse,
  AdminCategoryMutateResponse,
  AdminCategoryDeleteResponse,
} from './interfaces/admin-category.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminCategoriesService {
  private readonly logger = new Logger(AdminCategoriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ============================================================
  // GET LIST
  // ============================================================
  async findAll(dto: GetAdminCategoriesDto): Promise<AdminCategoriesListResponse> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {};

    if (dto.search) {
      where.OR = [
        { name: { contains: dto.search } },
        { slug: { contains: dto.search } },
      ];
    }

    if (typeof dto.isActive === 'boolean') {
      where.isActive = dto.isActive;
    }

    // parentId: null → lấy gốc; số → lọc theo cha; undefined → không lọc
    if (dto.parentId !== undefined) {
      where.parentId = dto.parentId === null ? null : dto.parentId;
    }

    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      [dto.sortBy ?? 'position']: dto.sortOrder ?? 'asc',
    };

    try {
      const [categories, total] = await this.prisma.$transaction([
        this.prisma.category.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            parentId: true,
            position: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            parent: { select: { name: true } },
            _count: { select: { products: true, children: true } },
          },
        }),
        this.prisma.category.count({ where }),
      ]);

      const data: AdminCategoryItem[] = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        iconUrl: c.iconUrl,
        parentId: c.parentId,
        parentName: c.parent?.name ?? null,
        position: c.position,
        isActive: c.isActive,
        productCount: c._count.products,
        childrenCount: c._count.children,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      return {
        statusCode: 200,
        message: 'Lấy danh sách chuyên mục thành công',
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch admin categories', error);
      throw new InternalServerErrorException('Không thể lấy danh sách chuyên mục');
    }
  }

  // ============================================================
  // GET DETAIL
  // ============================================================
  async findOne(id: number): Promise<AdminCategoryDetailResponse> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          children: {
            select: { id: true, name: true, slug: true, position: true, isActive: true },
            orderBy: { position: 'asc' },
          },
          _count: { select: { products: true } },
        },
      });

      if (!category) {
        throw new NotFoundException(`Không tìm thấy chuyên mục với ID = ${id}`);
      }

      const data: AdminCategoryDetail = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        iconUrl: category.iconUrl,
        parentId: category.parentId,
        position: category.position,
        isActive: category.isActive,
        parent: category.parent ?? null,
        children: category.children,
        productCount: category._count.products,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      return {
        statusCode: 200,
        message: 'Lấy thông tin chi tiết chuyên mục thành công',
        data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to fetch category id=${id}`, error);
      throw new InternalServerErrorException('Không thể lấy thông tin chuyên mục');
    }
  }

  // ============================================================
  // CREATE
  // ============================================================
  async create(dto: CreateCategoryDto): Promise<AdminCategoryMutateResponse> {
    const slug = dto.slug?.trim() || this.generateSlug(dto.name);

    // Check slug unique
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Slug '${slug}' đã tồn tại trong hệ thống`);
    }

    // Check parentId exists
    if (dto.parentId != null) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new BadRequestException(`Chuyên mục cha (parentId = ${dto.parentId}) không tồn tại`);
      }
    }

    try {
      const category = await this.prisma.category.create({
        data: {
          name: dto.name,
          slug,
          iconUrl: dto.iconUrl ?? null,
          parentId: dto.parentId ?? null,
          position: dto.position ?? 0,
          isActive: dto.isActive ?? true,
        },
      });

      await this.invalidatePublicCache();

      const data: AdminCategoryCreated = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        iconUrl: category.iconUrl,
        parentId: category.parentId,
        position: category.position,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      return {
        statusCode: 201,
        message: 'Tạo mới chuyên mục thành công',
        data,
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) throw error;
      this.logger.error('Failed to create category', error);
      throw new InternalServerErrorException('Không thể tạo mới chuyên mục');
    }
  }

  // ============================================================
  // UPDATE
  // ============================================================
  async update(id: number, dto: UpdateCategoryDto): Promise<AdminCategoryMutateResponse> {
    // Check category exists
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy chuyên mục với ID = ${id}`);
    }

    // Check slug unique nếu có thay đổi
    if (dto.slug && dto.slug !== category.slug) {
      const slugConflict = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
      if (slugConflict) {
        throw new ConflictException(`Slug '${dto.slug}' đã tồn tại trong hệ thống`);
      }
    }

    // Circular reference protection
    if (dto.parentId != null) {
      if (dto.parentId === id) {
        throw new BadRequestException('Chuyên mục không thể là cha của chính nó');
      }
      // Check parent exists
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new BadRequestException(`Chuyên mục cha (parentId = ${dto.parentId}) không tồn tại`);
      }
      // Check parentId is NOT a descendant of current category
      const isDescendant = await this.isDescendant(id, dto.parentId);
      if (isDescendant) {
        throw new BadRequestException(
          'Không thể gán chuyên mục con làm cha của chuyên mục hiện tại (circular reference)',
        );
      }
    }

    try {
      const updated = await this.prisma.category.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.slug !== undefined && { slug: dto.slug }),
          ...(dto.iconUrl !== undefined && { iconUrl: dto.iconUrl }),
          ...(dto.parentId !== undefined && { parentId: dto.parentId }),
          ...(dto.position !== undefined && { position: dto.position }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });

      await this.invalidatePublicCache();

      const data: AdminCategoryCreated = {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        iconUrl: updated.iconUrl,
        parentId: updated.parentId,
        position: updated.position,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };

      return {
        statusCode: 200,
        message: 'Cập nhật chuyên mục thành công',
        data,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(`Failed to update category id=${id}`, error);
      throw new InternalServerErrorException('Không thể cập nhật chuyên mục');
    }
  }

  // ============================================================
  // DELETE
  // ============================================================
  async remove(id: number): Promise<AdminCategoryDeleteResponse> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy chuyên mục với ID = ${id}`);
    }

    // Safety check: có sản phẩm?
    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new BadRequestException(
        `Không thể xóa chuyên mục này vì đang có ${productCount} sản phẩm liên quan. Vui lòng chuyển sản phẩm sang chuyên mục khác trước.`,
      );
    }

    // Safety check: có chuyên mục con?
    const childCount = await this.prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException(
        `Không thể xóa chuyên mục này vì đang có ${childCount} chuyên mục con. Vui lòng xóa hoặc chuyển chuyên mục con trước.`,
      );
    }

    try {
      await this.prisma.category.delete({ where: { id } });
      await this.invalidatePublicCache();

      return {
        statusCode: 200,
        message: 'Xóa chuyên mục thành công',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(`Failed to delete category id=${id}`, error);
      throw new InternalServerErrorException('Không thể xóa chuyên mục');
    }
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  /**
   * Kiểm tra xem targetId có phải là con cháu của ancestorId hay không.
   * Dùng để chặn circular reference khi update parentId.
   */
  private async isDescendant(ancestorId: number, targetId: number): Promise<boolean> {
    const children = await this.prisma.category.findMany({
      where: { parentId: ancestorId },
      select: { id: true },
    });
    for (const child of children) {
      if (child.id === targetId) return true;
      if (await this.isDescendant(child.id, targetId)) return true;
    }
    return false;
  }

  /**
   * Sinh slug từ tên tiếng Việt có dấu.
   */
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

  /**
   * Xóa toàn bộ cache public của Categories.
   * Bắt buộc gọi sau mỗi thao tác ghi dữ liệu.
   */
  private async invalidatePublicCache(): Promise<void> {
    try {
      await this.redis.delByPattern(CACHE_CONFIG.CATEGORIES.PREFIXES.ALL + '*');
      this.logger.log('✅ Đã xóa cache public categories sau thao tác admin');
    } catch (error) {
      this.logger.warn(`⚠️ Không thể xóa cache categories: ${error.message}`);
    }
  }
}
