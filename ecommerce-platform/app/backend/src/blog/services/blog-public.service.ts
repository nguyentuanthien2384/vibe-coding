import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import {
  PaginatedPostsDto,
  PostCategoryWithCountDto,
  PostDetailDto,
  PostListItemDto,
} from '../interfaces/blog.interface';
import { GetBlogPostsQueryDto, PostSortType } from '../dtos/get-blog-posts-query.dto';

@Injectable()
export class BlogPublicService {
  private readonly logger = new Logger(BlogPublicService.name);
  private readonly CACHE_TTL_CATEGORIES = 1800; // 30 phut
  private readonly CACHE_TTL_POST_DETAIL = 900; // 15 phut
  private readonly CACHE_TTL_POST_LIST = 300; // 5 phut

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ---------- SELECT FIELDS ----------
  private get postListSelect() {
    return {
      id: true,
      title: true,
      slug: true,
      summary: true,
      thumbnail: true,
      status: true,
      views: true,
      readTimeMinutes: true,
      publishedAt: true,
      author: {
        select: { id: true, fullName: true, avatarUrl: true, role: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      postTags: {
        select: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
    } as const;
  }

  private mapPostListItem(raw: any): PostListItemDto {
    return {
      ...raw,
      tags: raw.postTags.map((pt: any) => pt.tag),
    };
  }

  // ---------- CATEGORIES ----------
  async getCategories(): Promise<PostCategoryWithCountDto[]> {
    const cacheKey = 'cache:v1:blog:categories';
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as PostCategoryWithCountDto[];
    } catch (err) {
      this.logger.warn('Redis miss categories: ' + err);
    }

    const categories = await this.prisma.postCategory.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: {
            posts: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });

    const result: PostCategoryWithCountDto[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      postCount: cat._count.posts,
    }));

    try {
      await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL_CATEGORIES);
    } catch (err) {
      this.logger.warn('Redis set categories fail: ' + err);
    }

    return result;
  }

  // ---------- POSTS LIST ----------
  async getPublicPosts(query: GetBlogPostsQueryDto): Promise<PaginatedPostsDto> {
    const {
      page = 1,
      limit = 9,
      category,
      tag,
      q,
      sort = PostSortType.LATEST,
    } = query;

    const cacheKey = `cache:v1:blog:posts:${JSON.stringify(query)}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as PaginatedPostsDto;
    } catch (err) {
      this.logger.warn('Redis miss posts list: ' + err);
    }

    const where: any = { status: 'PUBLISHED' };
    if (category) where.category = { slug: category };
    if (tag) where.postTags = { some: { tag: { slug: tag } } };
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { summary: { contains: q } },
      ];
    }

    const orderBy =
      sort === PostSortType.VIEWS
        ? { views: 'desc' as const }
        : { publishedAt: 'desc' as const };

    const skip = (page - 1) * limit;
    const [posts, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: this.postListSelect,
      }),
      this.prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const result: PaginatedPostsDto = {
      items: posts.map((p) => this.mapPostListItem(p)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    try {
      await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL_POST_LIST);
    } catch (err) {
      this.logger.warn('Redis set posts list fail: ' + err);
    }

    return result;
  }

  // ---------- POST DETAIL ----------
  async getPostBySlug(slug: string): Promise<PostDetailDto> {
    const cacheKey = `cache:v1:blog:post:${slug}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as PostDetailDto;
    } catch (err) {
      this.logger.warn('Redis miss post detail: ' + err);
    }

    const post = await this.prisma.post.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            notes: true, // dung lam bio
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        postTags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
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

    if (!post) throw new NotFoundException(`Khong tim thay bai viet: ${slug}`);

    // Lay 3 bai viet lien quan cung chuyen muc
    const relatedRaw = await this.prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId: post.categoryId,
        id: { not: post.id },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: this.postListSelect,
    });

    const result: PostDetailDto = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      thumbnail: post.thumbnail,
      content: post.content as Record<string, unknown>,
      status: post.status,
      views: post.views,
      readTimeMinutes: post.readTimeMinutes,
      publishedAt: post.publishedAt,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      canonicalUrl: post.canonicalUrl,
      ogImage: post.ogImage,
      author: {
        id: post.author.id,
        fullName: post.author.fullName,
        avatarUrl: post.author.avatarUrl,
        role: post.author.role,
        bio: post.author.notes,
      },
      category: post.category,
      tags: post.postTags.map((pt) => pt.tag),
      products: post.postProducts.map((pp) => ({
        id: pp.id,
        postId: pp.postId,
        productId: pp.productId,
        displayOrder: pp.displayOrder,
        product: {
          ...pp.product,
          price: Number(pp.product.price),
          salePrice: pp.product.salePrice ? Number(pp.product.salePrice) : null,
        },
      })),
      relatedPosts: relatedRaw.map((p) => this.mapPostListItem(p)),
    };

    try {
      await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL_POST_DETAIL);
    } catch (err) {
      this.logger.warn('Redis set post detail fail: ' + err);
    }

    return result;
  }

  // ---------- RECORD VIEW ----------
  async recordPostView(slug: string): Promise<void> {
    const post = await this.prisma.post.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true },
    });

    if (!post) return;

    try {
      await this.redis.incr(`blog:views:${post.id}`);
    } catch (err) {
      this.logger.error('Failed to incr view counter: ' + err);
    }
  }
}
