import {
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BlogPublicService } from '../services/blog-public.service';
import { GetBlogPostsQueryDto } from '../dtos/get-blog-posts-query.dto';

@Controller('blog')
export class BlogPublicController {
  constructor(private readonly blogPublicService: BlogPublicService) {}

  /**
   * GET /api/v1/blog/categories
   * Lay danh sach chuyen muc blog co cache Redis
   */
  @Get('categories')
  async getCategories() {
    const data = await this.blogPublicService.getCategories();
    return {
      statusCode: 200,
      message: 'Lay danh sach chuyen muc blog thanh cong',
      data,
    };
  }

  /**
   * GET /api/v1/blog/posts
   * Lay danh sach bai viet cong khai co phan trang, loc, tim kiem
   */
  @Get('posts')
  async getPosts(@Query() query: GetBlogPostsQueryDto) {
    const data = await this.blogPublicService.getPublicPosts(query);
    return {
      statusCode: 200,
      message: 'Lay danh sach bai viet thanh cong',
      data,
    };
  }

  /**
   * GET /api/v1/blog/posts/:slug
   * Lay chi tiet 1 bai viet theo slug (co ho tro che do xem truoc preview=true)
   */
  @Get('posts/:slug')
  async getPostBySlug(
    @Param('slug') slug: string,
    @Query('preview') preview?: string,
  ) {
    const data = await this.blogPublicService.getPostBySlug(slug, preview === 'true');
    return {
      statusCode: 200,
      message: 'Lay chi tiet bai viet thanh cong',
      data,
    };
  }

  /**
   * POST /api/v1/blog/posts/:slug/view
   * Ghi nhan luot xem bat dong bo qua Redis INCR (chong spam)
   */
  @Post('posts/:slug/view')
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  async recordView(@Param('slug') slug: string) {
    await this.blogPublicService.recordPostView(slug);
    return {
      statusCode: 200,
      message: 'Ghi nhan luot xem thanh cong',
    };
  }
}
