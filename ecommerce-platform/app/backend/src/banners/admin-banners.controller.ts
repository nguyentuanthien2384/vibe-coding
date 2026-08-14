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
import { BannersService } from './banners.service';
import { GetBannersAdminDto } from './dto/get-banners-admin.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ReorderBannersDto } from './dto/reorder-banners.dto';
import { AdminBannerMutateResponse, BannersResponse } from './interfaces/banner-response.interface';

@Controller('admin/banners')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminBannersController {
  constructor(private readonly bannersService: BannersService) {}

  /**
   * GET /api/v1/admin/banners
   * Lấy tất cả danh sách Banner (bao gồm cả Inactive) cho Admin Dashboard
   * Quyền: ADMIN, STAFF
   */
  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  async findAllAdmin(@Query() dto: GetBannersAdminDto): Promise<BannersResponse> {
    return this.bannersService.findAllAdmin(dto);
  }

  /**
   * POST /api/v1/admin/banners
   * Tạo mới 1 Banner quảng cáo
   * Quyền: ADMIN
   */
  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createBanner(@Body() dto: CreateBannerDto): Promise<AdminBannerMutateResponse> {
    return this.bannersService.createBanner(dto);
  }

  /**
   * PATCH /api/v1/admin/banners/reorder
   * Thay đổi thứ tự danh sách Banners hàng loạt
   * Quyền: ADMIN
   */
  @Patch('reorder')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async reorderBanners(
    @Body() dto: ReorderBannersDto,
  ): Promise<{ statusCode: number; message: string }> {
    return this.bannersService.reorderBanners(dto);
  }

  /**
   * PATCH /api/v1/admin/banners/:id
   * Cập nhật thông tin 1 Banner
   * Quyền: ADMIN
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBannerDto,
  ): Promise<AdminBannerMutateResponse> {
    return this.bannersService.updateBanner(id, dto);
  }

  /**
   * DELETE /api/v1/admin/banners/:id
   * Xóa 1 Banner và dọn dẹp file ảnh đĩa tương ứng
   * Quyền: ADMIN
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteBanner(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ statusCode: number; message: string }> {
    return this.bannersService.deleteBanner(id);
  }
}
