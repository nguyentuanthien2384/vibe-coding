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
import { AdminProductsService } from './admin-products.service';
import { GetAdminProductsDto } from './dto/get-admin-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  AdminProductDetailResponse,
  AdminProductDeleteResponse,
  AdminProductListResponse,
  AdminProductMutateResponse,
} from './interfaces/admin-product.interface';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  /**
   * GET /api/v1/admin/products
   * Lấy danh sách sản phẩm phân trang cho Admin Dashboard.
   * Quyền: ADMIN, STAFF
   */
  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  findAll(@Query() dto: GetAdminProductsDto): Promise<AdminProductListResponse> {
    return this.adminProductsService.findAll(dto);
  }

  /**
   * GET /api/v1/admin/products/:id
   * Lấy thông tin chi tiết một sản phẩm theo ID.
   * Quyền: ADMIN, STAFF
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AdminProductDetailResponse> {
    return this.adminProductsService.findOne(id);
  }

  /**
   * POST /api/v1/admin/products
   * Tạo mới sản phẩm.
   * Quyền: ADMIN only
   */
  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProductDto): Promise<AdminProductMutateResponse> {
    return this.adminProductsService.create(dto);
  }

  /**
   * PATCH /api/v1/admin/products/:id
   * Cập nhật thông tin sản phẩm.
   * Quyền: ADMIN only
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<AdminProductMutateResponse> {
    return this.adminProductsService.update(id, dto);
  }

  /**
   * DELETE /api/v1/admin/products/:id
   * Xóa vĩnh viễn sản phẩm (Kiểm tra an toàn đơn hàng).
   * Quyền: ADMIN only
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminProductDeleteResponse> {
    return this.adminProductsService.remove(id);
  }
}
