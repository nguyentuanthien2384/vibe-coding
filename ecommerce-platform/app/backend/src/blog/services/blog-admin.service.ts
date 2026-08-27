import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { UploadService } from '../../upload/upload.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { UpdatePostStatusDto } from '../dtos/update-post-status.dto';
import { CreatePostCategoryDto } from '../dtos/create-post-category.dto';
import { UpdatePostCategoryDto } from '../dtos/update-post-category.dto';
import { AdminGetPostsQueryDto } from '../dtos/admin-get-posts-query.dto';
import {
  AdminPostListItemDto,
  AdminPostDetailDto,
  PaginationMeta,
  PostCategoryWithCountDto,
} from '../interfaces/blog.interface';
import { Prisma, PostStatus } from '@prisma/client';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

@Injectable()
export class BlogAdminService {
  private readonly logger = new Logger(BlogAdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly uploadService: UploadService,
  ) {}

  // =========================================================================
  // CACHE INVALIDATION & WEBHOOK REVALIDATION
  // =========================================================================
  private async invalidateBlogCache(slug?: string): Promise<void> {
    try {
      const keys = await this.redis.keys('cache:v1:blog:posts:*');
      if (keys.length > 0) {
        await Promise.all(keys.map((k) => this.redis.del(k)));
      }
      await this.redis.del('cache:v1:blog:categories');
      if (slug) await this.redis.del(`cache:v1:blog:post:${slug}`);
    } catch (err) {
      this.logger.warn('Cache invalidation fail: ' + err);
    }

    // Next.js on-demand revalidation trigger
    try {
      const frontendUrl = this.config.get<string>('FRONTEND_URL');
      const secret = this.config.get<string>('REVALIDATE_SECRET');
      if (frontendUrl && secret) {
        await fetch(`${frontendUrl}/api/revalidate?tag=blog-posts&secret=${secret}`, {
          method: 'POST',
        });
      }
    } catch (err) {
      this.logger.warn('Next.js revalidation fail: ' + err);
    }
  }

  // =========================================================================
  // POSTS MANAGEMENT
  // =========================================================================

  /**
   * Lấy danh sách bài viết phân trang dành cho Admin Dashboard
   */
  async getAdminPosts(
    query: AdminGetPostsQueryDto,
  ): Promise<{ items: AdminPostListItemDto[]; meta: PaginationMeta }> {
    const { page = 1, limit = 10, status, categoryId, q, search, sortBy = 'latest' } = query;
    const searchTerm = (search || q || '').trim();

    const where: Prisma.PostWhereInput = {};

    if (status && status !== 'ALL') {
      if (Object.values(PostStatus).includes(status as PostStatus)) {
        where.status = status as PostStatus;
      }
    }

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm } },
        { slug: { contains: searchTerm } },
        { author: { fullName: { contains: searchTerm } } },
      ];
    }

    const orderBy: Prisma.PostOrderByWithRelationInput =
      sortBy === 'views' ? { views: 'desc' } : { createdAt: 'desc' };

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          author: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          postTags: {
            include: {
              tag: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const items: AdminPostListItemDto[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      thumbnail: post.thumbnail,
      status: post.status,
      views: post.views,
      readTimeMinutes: post.readTimeMinutes,
      categoryId: post.categoryId,
      category: post.category,
      authorId: post.authorId,
      author: post.author,
      tags: post.postTags.map((pt) => pt.tag),
      publishedAt: post.publishedAt,
      scheduledAt: post.scheduledAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Lấy chi tiết bài viết theo ID
   */
  async getAdminPostById(id: number): Promise<AdminPostDetailDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        author: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        postTags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
        postProducts: {
          orderBy: { displayOrder: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
                price: true,
                salePrice: true,
                stock: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết ID ${id}`);
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      thumbnail: post.thumbnail,
      content: post.content as Record<string, unknown>,
      status: post.status,
      views: post.views,
      readTimeMinutes: post.readTimeMinutes,
      categoryId: post.categoryId,
      category: post.category,
      authorId: post.authorId,
      author: post.author,
      tags: post.postTags.map((pt) => pt.tag),
      products: post.postProducts.map((pp) => ({
        id: pp.id,
        postId: pp.postId,
        productId: pp.productId,
        displayOrder: pp.displayOrder,
        product: {
          ...pp.product,
          price: Number(pp.product.price),
          salePrice: pp.product.salePrice !== null ? Number(pp.product.salePrice) : null,
        },
      })),
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      canonicalUrl: post.canonicalUrl,
      ogImage: post.ogImage,
      publishedAt: post.publishedAt,
      scheduledAt: post.scheduledAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  /**
   * Tạo mới bài viết
   */
  async createPost(
    dto: CreatePostDto,
    authorId: number,
  ): Promise<{ id: number; title: string; slug: string; status: string; createdAt: Date }> {
    const finalSlug = dto.slug ? slugify(dto.slug) : slugify(dto.title);

    const exists = await this.prisma.post.findUnique({
      where: { slug: finalSlug },
      select: { id: true },
    });
    if (exists) {
      throw new ConflictException(`Slug "${finalSlug}" đã tồn tại. Vui lòng chọn tiêu đề hoặc slug khác.`);
    }

    // Kiểm tra category tồn tại
    const cat = await this.prisma.postCategory.findUnique({
      where: { id: dto.categoryId },
      select: { id: true },
    });
    if (!cat) {
      throw new BadRequestException(`Chuyên mục ID ${dto.categoryId} không tồn tại.`);
    }

    // Tự động tính readTime nếu không truyền
    const readTime = dto.readTimeMinutes || 5;

    try {
      const isPublished = dto.status === PostStatus.PUBLISHED;
      const scheduledAt =
        dto.status === PostStatus.SCHEDULED && dto.scheduledAt
          ? new Date(dto.scheduledAt)
          : null;

      const post = await this.prisma.post.create({
        data: {
          title: dto.title.trim(),
          slug: finalSlug,
          summary: dto.summary.trim(),
          thumbnail: dto.thumbnail.trim(),
          content: dto.content as Prisma.InputJsonValue,
          status: dto.status,
          readTimeMinutes: readTime,
          categoryId: dto.categoryId,
          authorId,
          scheduledAt,
          publishedAt: isPublished ? new Date() : null,
          metaTitle: dto.metaTitle ?? null,
          metaDescription: dto.metaDescription ?? null,
          ogImage: dto.ogImage ?? null,
          canonicalUrl: dto.canonicalUrl ?? null,
          postTags: dto.tagIds?.length
            ? { create: dto.tagIds.map((tagId) => ({ tagId })) }
            : undefined,
          postProducts: dto.productIds?.length
            ? {
                create: dto.productIds.map((productId, idx) => ({
                  productId,
                  displayOrder: idx + 1,
                })),
              }
            : undefined,
        },
        select: { id: true, title: true, slug: true, status: true, createdAt: true },
      });

      await this.invalidateBlogCache(finalSlug);
      return { ...post, status: post.status.toString() };
    } catch (err) {
      this.logger.error('createPost error: ' + err);
      throw new InternalServerErrorException('Tạo bài viết mới thất bại');
    }
  }

  /**
   * Cập nhật toàn bộ thông tin bài viết
   */
  async updatePost(
    id: number,
    dto: UpdatePostDto,
  ): Promise<{ id: number; slug: string; status: string; updatedAt: Date }> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true, slug: true, status: true },
    });
    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết ID ${id}`);
    }

    const finalSlug = dto.slug ? slugify(dto.slug) : dto.title ? slugify(dto.title) : undefined;

    if (finalSlug && finalSlug !== post.slug) {
      const exists = await this.prisma.post.findUnique({
        where: { slug: finalSlug },
        select: { id: true },
      });
      if (exists && exists.id !== id) {
        throw new ConflictException(`Slug "${finalSlug}" đã tồn tại trên bài viết khác.`);
      }
    }

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        // Đồng bộ postTags
        if (dto.tagIds !== undefined) {
          await tx.postTag.deleteMany({ where: { postId: id } });
          if (dto.tagIds.length > 0) {
            await tx.postTag.createMany({
              data: dto.tagIds.map((tagId) => ({ postId: id, tagId })),
            });
          }
        }

        // Đồng bộ postProducts
        if (dto.productIds !== undefined) {
          await tx.postProduct.deleteMany({ where: { postId: id } });
          if (dto.productIds.length > 0) {
            await tx.postProduct.createMany({
              data: dto.productIds.map((productId, idx) => ({
                postId: id,
                productId,
                displayOrder: idx + 1,
              })),
            });
          }
        }

        const publishedAt =
          dto.status === PostStatus.PUBLISHED && post.status !== PostStatus.PUBLISHED
            ? new Date()
            : undefined;

        const scheduledAt =
          dto.status === PostStatus.SCHEDULED && dto.scheduledAt !== undefined
            ? dto.scheduledAt ? new Date(dto.scheduledAt) : null
            : undefined;

        return tx.post.update({
          where: { id },
          data: {
            ...(dto.title !== undefined && { title: dto.title.trim() }),
            ...(finalSlug !== undefined && { slug: finalSlug }),
            ...(dto.summary !== undefined && { summary: dto.summary.trim() }),
            ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail.trim() }),
            ...(dto.content !== undefined && { content: dto.content as Prisma.InputJsonValue }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
            ...(dto.readTimeMinutes !== undefined && { readTimeMinutes: dto.readTimeMinutes }),
            ...(scheduledAt !== undefined && { scheduledAt }),
            ...(publishedAt && { publishedAt }),
            ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
            ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
            ...(dto.ogImage !== undefined && { ogImage: dto.ogImage }),
            ...(dto.canonicalUrl !== undefined && { canonicalUrl: dto.canonicalUrl }),
          },
          select: { id: true, slug: true, status: true, updatedAt: true },
        });
      });

      const slugToInvalidate = finalSlug || post.slug;
      await this.invalidateBlogCache(slugToInvalidate);
      return { ...updated, status: updated.status.toString() };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
      this.logger.error('updatePost error: ' + err);
      throw new InternalServerErrorException('Cập nhật bài viết thất bại');
    }
  }

  /**
   * Đổi nhanh trạng thái bài viết
   */
  async changeStatus(id: number, dto: UpdatePostStatusDto): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true, slug: true, status: true },
    });
    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết ID ${id}`);
    }

    const publishedAt =
      dto.status === PostStatus.PUBLISHED && post.status !== PostStatus.PUBLISHED
        ? new Date()
        : undefined;

    await this.prisma.post.update({
      where: { id },
      data: {
        status: dto.status,
        ...(publishedAt && { publishedAt }),
      },
    });

    await this.invalidateBlogCache(post.slug);
  }

  /**
   * Xóa bài viết và dọn dẹp thumbnail nếu không còn tham chiếu
   */
  async deletePost(id: number): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true, slug: true, thumbnail: true },
    });
    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết ID ${id}`);
    }

    const thumbnail = post.thumbnail;
    await this.prisma.post.delete({ where: { id } });

    // Dọn dẹp thumbnail file
    if (thumbnail) {
      try {
        await this.uploadService.deleteImageFile(thumbnail);
      } catch (err) {
        this.logger.warn(`Could not delete thumbnail file ${thumbnail}: ${err}`);
      }
    }

    await this.invalidateBlogCache(post.slug);
  }

  // =========================================================================
  // CATEGORIES MANAGEMENT
  // =========================================================================

  /**
   * Lấy danh sách chuyên mục kèm số lượng bài viết
   */
  async getAdminCategories(): Promise<PostCategoryWithCountDto[]> {
    const categories = await this.prisma.postCategory.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      orderIndex: cat.orderIndex,
      isActive: cat.isActive,
      postCount: cat._count.posts,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }

  /**
   * Tạo mới chuyên mục
   */
  async createCategory(dto: CreatePostCategoryDto) {
    const finalSlug = dto.slug ? slugify(dto.slug) : slugify(dto.name);

    const exists = await this.prisma.postCategory.findUnique({
      where: { slug: finalSlug },
      select: { id: true },
    });
    if (exists) {
      throw new ConflictException(`Slug chuyên mục "${finalSlug}" đã tồn tại`);
    }

    const cat = await this.prisma.postCategory.create({
      data: {
        name: dto.name.trim(),
        slug: finalSlug,
        description: dto.description?.trim() ?? null,
        icon: dto.icon?.trim() ?? null,
        orderIndex: dto.orderIndex ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    await this.redis.del('cache:v1:blog:categories');
    return cat;
  }

  /**
   * Cập nhật chuyên mục
   */
  async updateCategory(id: number, dto: UpdatePostCategoryDto) {
    const cat = await this.prisma.postCategory.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!cat) {
      throw new NotFoundException(`Không tìm thấy chuyên mục ID ${id}`);
    }

    const finalSlug = dto.slug ? slugify(dto.slug) : dto.name ? slugify(dto.name) : undefined;

    if (finalSlug && finalSlug !== cat.slug) {
      const exists = await this.prisma.postCategory.findUnique({
        where: { slug: finalSlug },
        select: { id: true },
      });
      if (exists && exists.id !== id) {
        throw new ConflictException(`Slug chuyên mục "${finalSlug}" đã tồn tại`);
      }
    }

    const updated = await this.prisma.postCategory.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(finalSlug !== undefined && { slug: finalSlug }),
        ...(dto.description !== undefined && { description: dto.description?.trim() ?? null }),
        ...(dto.icon !== undefined && { icon: dto.icon?.trim() ?? null }),
        ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    await this.redis.del('cache:v1:blog:categories');
    return updated;
  }

  /**
   * Xóa chuyên mục (Kiểm tra an toàn dữ liệu)
   */
  async deleteCategory(id: number): Promise<void> {
    const cat = await this.prisma.postCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    });

    if (!cat) {
      throw new NotFoundException(`Không tìm thấy chuyên mục ID ${id}`);
    }

    if (cat._count.posts > 0) {
      throw new BadRequestException(
        `Không thể xóa chuyên mục đang chứa ${cat._count.posts} bài viết. Vui lòng chuyển bài viết sang chuyên mục khác trước khi xóa.`,
      );
    }

    await this.prisma.postCategory.delete({ where: { id } });
    await this.redis.del('cache:v1:blog:categories');
  }

  // =========================================================================
  // EMBEDDED PRODUCTS SEARCH
  // =========================================================================

  /**
   * Tìm kiếm sản phẩm để gắn kèm (Cross-sell) vào bài viết
   */
  async searchEmbedProducts(query?: string) {
    const q = (query || '').trim();
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { slug: { contains: q } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        price: true,
        salePrice: true,
        stock: true,
        isActive: true,
      },
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      salePrice: p.salePrice !== null ? Number(p.salePrice) : null,
    }));
  }
}
