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
  UseGuards,
} from '@nestjs/common';
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

@Controller('api/v1/admin/blog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class BlogAdminController {
  constructor(private readonly blogAdminService: BlogAdminService) {}

  // ========================
  // POSTS
  // ========================

  @Get('posts')
  async getAdminPosts(@Query() query: AdminGetPostsQueryDto) {
    const data = await this.blogAdminService.getAdminPosts(query);
    return {
      statusCode: 200,
      message: 'Lay danh sach bai viet quan tri thanh cong',
      data,
    };
  }

  @Post('posts')
  async createPost(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.blogAdminService.createPost(dto, user.sub);
    return {
      statusCode: 201,
      message: 'Tao bai viet moi thanh cong',
      data,
    };
  }

  @Put('posts/:id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ) {
    const data = await this.blogAdminService.updatePost(id, dto);
    return {
      statusCode: 200,
      message: 'Cap nhat bai viet thanh cong',
      data,
    };
  }

  @Patch('posts/:id/status')
  @HttpCode(HttpStatus.OK)
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostStatusDto,
  ) {
    await this.blogAdminService.changeStatus(id, dto);
    return {
      statusCode: 200,
      message: 'Cap nhat trang thai bai viet thanh cong',
    };
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    await this.blogAdminService.deletePost(id);
    return {
      statusCode: 200,
      message: 'Da xoa bai viet thanh cong',
    };
  }

  // ========================
  // CATEGORIES
  // ========================

  @Get('categories')
  async getCategories() {
    const data = await this.blogAdminService.getAdminCategories();
    return {
      statusCode: 200,
      message: 'Lay danh sach chuyen muc thanh cong',
      data,
    };
  }

  @Post('categories')
  async createCategory(@Body() dto: CreatePostCategoryDto) {
    const data = await this.blogAdminService.createCategory(dto);
    return {
      statusCode: 201,
      message: 'Tao chuyen muc thanh cong',
      data,
    };
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostCategoryDto,
  ) {
    const data = await this.blogAdminService.updateCategory(id, dto);
    return {
      statusCode: 200,
      message: 'Cap nhat chuyen muc thanh cong',
      data,
    };
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.blogAdminService.deleteCategory(id);
    return {
      statusCode: 200,
      message: 'Da xoa chuyen muc thanh cong',
    };
  }
}
