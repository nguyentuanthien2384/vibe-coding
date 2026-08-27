import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { UpdatePostStatusDto } from '../dtos/update-post-status.dto';
import { CreatePostCategoryDto } from '../dtos/create-post-category.dto';
import { UpdatePostCategoryDto } from '../dtos/update-post-category.dto';
import { AdminGetPostsQueryDto } from '../dtos/admin-get-posts-query.dto';
import { AdminPostListItemDto, PaginationMeta } from '../interfaces/blog.interface';
import { Prisma, PostStatus } from '@prisma/client';

@Injectable()
export class BlogAdminService {
  private readonly logger = new Logger(BlogAdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  // ---------- CACHE INVALIDATION ----------
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

    // Next.js on-demand revalidation
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

  // ---------- ADMIN POSTS ----------
  async getAdminPosts(
    query: AdminGetPostsQueryDto,
  ): Promise<{ items: AdminPostListItemDto[]; meta: PaginationMeta }> {
    const { page = 1, limit = 10, status, categoryId, q } = query;
    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { slug: { contains: q } },
      ];
    }

    const skip = (page - 1) * limit;
    const [posts, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          status: true,
          views: true,
          publishedAt: true,
          scheduledAt: true,
          createdAt: true,
          category: { select: { id: true, name: true } },
          author: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    return {
      items: posts as AdminPostListItemDto[],
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async createPost(dto: CreatePostDto, authorId: number): Promise<{ id: number; title: string; slug: string; status: string; createdAt: Date }> {
    const exists = await this.prisma.post.findUnique({ where: { slug: dto.slug }, select: { id: true } });
    if (exists) throw new ConflictException(`Slug "${dto.slug}" da ton tai`);

    try {
      const post = await this.prisma.post.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          summary: dto.summary,
          thumbnail: dto.thumbnail,
          content: dto.content as Prisma.InputJsonValue,
          status: dto.status,
          categoryId: dto.categoryId,
          authorId,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
          publishedAt: dto.status === PostStatus.PUBLISHED ? new Date() : null,
          metaTitle: dto.metaTitle,
          metaDescription: dto.metaDescription,
          ogImage: dto.ogImage,
          canonicalUrl: dto.canonicalUrl,
          postTags: dto.tagIds?.length
            ? { create: dto.tagIds.map((tagId) => ({ tagId })) }
            : undefined,
          postProducts: dto.productIds?.length
            ? { create: dto.productIds.map((productId, i) => ({ productId, displayOrder: i })) }
            : undefined,
        },
        select: { id: true, title: true, slug: true, status: true, createdAt: true },
      });

      await this.invalidateBlogCache();
      return { ...post, status: post.status.toString() };
    } catch (err) {
      this.logger.error('createPost error: ' + err);
      throw new InternalServerErrorException('Tao bai viet that bai');
    }
  }

  async updatePost(id: number, dto: UpdatePostDto): Promise<{ id: number; slug: string; status: string; updatedAt: Date }> {
    const post = await this.prisma.post.findUnique({ where: { id }, select: { id: true, slug: true, status: true } });
    if (!post) throw new NotFoundException(`Khong tim thay bai viet id=${id}`);

    if (dto.slug && dto.slug !== post.slug) {
      const exists = await this.prisma.post.findUnique({ where: { slug: dto.slug }, select: { id: true } });
      if (exists) throw new ConflictException(`Slug "${dto.slug}" da ton tai`);
    }

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        // Update tags if provided
        if (dto.tagIds !== undefined) {
          await tx.postTag.deleteMany({ where: { postId: id } });
          if (dto.tagIds.length > 0) {
            await tx.postTag.createMany({
              data: dto.tagIds.map((tagId) => ({ postId: id, tagId })),
            });
          }
        }

        // Update products if provided
        if (dto.productIds !== undefined) {
          await tx.postProduct.deleteMany({ where: { postId: id } });
          if (dto.productIds.length > 0) {
            await tx.postProduct.createMany({
              data: dto.productIds.map((productId, i) => ({ postId: id, productId, displayOrder: i })),
            });
          }
        }

        const publishedAt =
          dto.status === PostStatus.PUBLISHED && post.status !== PostStatus.PUBLISHED
            ? new Date()
            : undefined;

        return tx.post.update({
          where: { id },
          data: {
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.slug !== undefined && { slug: dto.slug }),
            ...(dto.summary !== undefined && { summary: dto.summary }),
            ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
            ...(dto.content !== undefined && { content: dto.content as Prisma.InputJsonValue }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(dto.categoryId !== undefined && { category: { connect: { id: dto.categoryId } } }),
            ...(dto.scheduledAt !== undefined && { scheduledAt: new Date(dto.scheduledAt) }),
            ...(publishedAt && { publishedAt }),
            ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
            ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
            ...(dto.ogImage !== undefined && { ogImage: dto.ogImage }),
            ...(dto.canonicalUrl !== undefined && { canonicalUrl: dto.canonicalUrl }),
          },
          select: { id: true, slug: true, status: true, updatedAt: true },
        });
      });

      const slugToInvalidate = dto.slug || post.slug;
      await this.invalidateBlogCache(slugToInvalidate);
      return { ...updated, status: updated.status.toString() };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
      this.logger.error('updatePost error: ' + err);
      throw new InternalServerErrorException('Cap nhat bai viet that bai');
    }
  }

  async changeStatus(id: number, dto: UpdatePostStatusDto): Promise<void> {
    const post = await this.prisma.post.findUnique({ where: { id }, select: { id: true, slug: true, status: true } });
    if (!post) throw new NotFoundException(`Khong tim thay bai viet id=${id}`);

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

  async deletePost(id: number): Promise<void> {
    const post = await this.prisma.post.findUnique({ where: { id }, select: { id: true, slug: true } });
    if (!post) throw new NotFoundException(`Khong tim thay bai viet id=${id}`);

    await this.prisma.post.delete({ where: { id } });
    await this.invalidateBlogCache(post.slug);
  }

  // ---------- CATEGORIES ----------
  async getAdminCategories() {
    return this.prisma.postCategory.findMany({ orderBy: { orderIndex: 'asc' } });
  }

  async createCategory(dto: CreatePostCategoryDto) {
    const exists = await this.prisma.postCategory.findUnique({ where: { slug: dto.slug }, select: { id: true } });
    if (exists) throw new ConflictException(`Slug chuyen muc "${dto.slug}" da ton tai`);
    const cat = await this.prisma.postCategory.create({ data: dto });
    await this.redis.del('cache:v1:blog:categories');
    return cat;
  }

  async updateCategory(id: number, dto: UpdatePostCategoryDto) {
    const cat = await this.prisma.postCategory.findUnique({ where: { id }, select: { id: true } });
    if (!cat) throw new NotFoundException(`Khong tim thay chuyen muc id=${id}`);
    const updated = await this.prisma.postCategory.update({ where: { id }, data: dto });
    await this.redis.del('cache:v1:blog:categories');
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    const cat = await this.prisma.postCategory.findUnique({ where: { id }, select: { id: true } });
    if (!cat) throw new NotFoundException(`Khong tim thay chuyen muc id=${id}`);
    await this.prisma.postCategory.delete({ where: { id } });
    await this.redis.del('cache:v1:blog:categories');
  }
}
