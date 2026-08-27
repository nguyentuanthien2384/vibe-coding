import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BlogAdminService } from '../services/blog-admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/interfaces/auth-response.interface';
import { Role } from '@prisma/client';
import { CreatePostDto } from '../dtos/create-post.dto';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { UpdatePostStatusDto } from '../dtos/update-post-status.dto';
import { CreatePostCategoryDto } from '../dtos/create-post-category.dto';
import { UpdatePostCategoryDto } from '../dtos/update-post-category.dto';
import { AdminGetPostsQueryDto } from '../dtos/admin-get-posts-query.dto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'images');

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller('admin/blog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class BlogAdminController {
  constructor(private readonly blogAdminService: BlogAdminService) {}

  // =========================================================================
  // POSTS
  // =========================================================================

  /**
   * GET /api/v1/admin/blog/posts
   * Lấy danh sách bài viết quản trị (Lọc, tìm kiếm, sắp xếp, phân trang)
   */
  @Get('posts')
  async getAdminPosts(@Query() query: AdminGetPostsQueryDto) {
    const data = await this.blogAdminService.getAdminPosts(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách bài viết quản trị thành công',
      data,
    };
  }

  /**
   * GET /api/v1/admin/blog/posts/:id
   * Lấy chi tiết bài viết theo ID
   */
  @Get('posts/:id')
  async getAdminPostById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.blogAdminService.getAdminPostById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin chi tiết bài viết thành công',
      data,
    };
  }

  /**
   * POST /api/v1/admin/blog/posts
   * Tạo mới bài viết
   */
  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.blogAdminService.createPost(dto, user.sub);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo bài viết mới thành công',
      data,
    };
  }

  /**
   * PUT /api/v1/admin/blog/posts/:id
   * Cập nhật toàn bộ bài viết
   */
  @Put('posts/:id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ) {
    const data = await this.blogAdminService.updatePost(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật bài viết thành công',
      data,
    };
  }

  /**
   * PATCH /api/v1/admin/blog/posts/:id
   * Cập nhật một phần bài viết
   */
  @Patch('posts/:id')
  async patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ) {
    const data = await this.blogAdminService.updatePost(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật bài viết thành công',
      data,
    };
  }

  /**
   * PATCH /api/v1/admin/blog/posts/:id/status
   * Đổi nhanh trạng thái bài viết
   */
  @Patch('posts/:id/status')
  @HttpCode(HttpStatus.OK)
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostStatusDto,
  ) {
    await this.blogAdminService.changeStatus(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật trạng thái bài viết thành công',
    };
  }

  /**
   * DELETE /api/v1/admin/blog/posts/:id
   * Xóa bài viết và dọn dẹp file thumbnail
   */
  @Delete('posts/:id')
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    await this.blogAdminService.deletePost(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã xóa bài viết thành công',
    };
  }

  /**
   * POST /api/v1/admin/blog/posts/upload-thumbnail
   * Upload thumbnail bài viết
   */
  @Post('posts/upload-thumbnail')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `blog-thumbnail-${unique}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Định dạng file không hỗ trợ. Chỉ chấp nhận JPEG, PNG, WebP, SVG, GIF.',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  uploadThumbnail(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file nào được tải lên');
    }

    const url = `/uploads/images/${file.filename}`;

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Upload hình ảnh thumbnail thành công',
      data: {
        url,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      },
    };
  }

  // =========================================================================
  // CATEGORIES
  // =========================================================================

  /**
   * GET /api/v1/admin/blog/categories
   * Lấy danh sách chuyên mục kèm số lượng bài viết
   */
  @Get('categories')
  async getCategories() {
    const data = await this.blogAdminService.getAdminCategories();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách chuyên mục thành công',
      data,
    };
  }

  /**
   * POST /api/v1/admin/blog/categories
   * Tạo mới chuyên mục blog
   */
  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreatePostCategoryDto) {
    const data = await this.blogAdminService.createCategory(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo chuyên mục thành công',
      data,
    };
  }

  /**
   * PATCH /api/v1/admin/blog/categories/:id
   * Cập nhật chuyên mục blog
   */
  @Patch('categories/:id')
  async patchCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostCategoryDto,
  ) {
    const data = await this.blogAdminService.updateCategory(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật chuyên mục thành công',
      data,
    };
  }

  /**
   * PUT /api/v1/admin/blog/categories/:id
   * Cập nhật chuyên mục blog
   */
  @Put('categories/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostCategoryDto,
  ) {
    const data = await this.blogAdminService.updateCategory(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật chuyên mục thành công',
      data,
    };
  }

  /**
   * DELETE /api/v1/admin/blog/categories/:id
   * Xóa chuyên mục blog
   */
  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.blogAdminService.deleteCategory(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã xóa chuyên mục thành công',
    };
  }

  // =========================================================================
  // EMBEDDED PRODUCTS SEARCH
  // =========================================================================

  /**
   * GET /api/v1/admin/blog/products/search-embed
   * Tìm kiếm sản phẩm để gắn kèm vào bài viết
   */
  @Get('products/search-embed')
  async searchEmbedProducts(
    @Query('q') q?: string,
    @Query('search') search?: string,
  ) {
    const query = q || search;
    const data = await this.blogAdminService.searchEmbedProducts(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tìm kiếm sản phẩm thành công',
      data,
    };
  }
}
