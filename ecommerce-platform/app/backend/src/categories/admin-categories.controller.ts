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
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminCategoriesService } from './admin-categories.service';
import { GetAdminCategoriesDto } from './dto/get-admin-categories.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  AdminCategoriesListResponse,
  AdminCategoryDetailResponse,
  AdminCategoryMutateResponse,
  AdminCategoryDeleteResponse,
} from './interfaces/admin-category.interface';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCategoriesController {
  constructor(private readonly adminCategoriesService: AdminCategoriesService) {}

  /**
   * GET /api/v1/admin/categories
   * Lấy danh sách chuyên mục có phân trang, lọc và tìm kiếm.
   * Quyền: ADMIN, STAFF
   */
  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  findAll(@Query() dto: GetAdminCategoriesDto): Promise<AdminCategoriesListResponse> {
    return this.adminCategoriesService.findAll(dto);
  }

  /**
   * GET /api/v1/admin/categories/:id
   * Lấy chi tiết một chuyên mục theo ID.
   * Quyền: ADMIN, STAFF
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AdminCategoryDetailResponse> {
    return this.adminCategoriesService.findOne(id);
  }

  /**
   * POST /api/v1/admin/categories
   * Tạo mới chuyên mục.
   * Quyền: ADMIN only
   */
  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCategoryDto): Promise<AdminCategoryMutateResponse> {
    return this.adminCategoriesService.create(dto);
  }

  /**
   * PATCH /api/v1/admin/categories/:id
   * Cập nhật thông tin chuyên mục.
   * Quyền: ADMIN only
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<AdminCategoryMutateResponse> {
    return this.adminCategoriesService.update(id, dto);
  }

  /**
   * DELETE /api/v1/admin/categories/:id
   * Xóa chuyên mục. Chặn nếu còn sản phẩm hoặc chuyên mục con.
   * Quyền: ADMIN only
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminCategoryDeleteResponse> {
    return this.adminCategoriesService.remove(id);
  }
}
