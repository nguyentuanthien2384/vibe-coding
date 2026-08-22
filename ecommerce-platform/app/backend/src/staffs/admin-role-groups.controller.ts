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
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRoleGroupsService } from './admin-role-groups.service';
import { CreateRoleGroupDto } from './dto/create-role-group.dto';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import {
  RoleGroupDetailResponse,
  RoleGroupMutateResponse,
  RoleGroupsListResponse,
} from './interfaces/role-group.interface';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminRoleGroupsController {
  constructor(private readonly roleGroupsService: AdminRoleGroupsService) {}

  /**
   * GET /api/v1/admin/permissions
   * Lấy danh mục tất cả quyền hạn có sẵn trong hệ thống
   * Quyền: ADMIN
   */
  @Get('permissions')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  getPermissions() {
    return this.roleGroupsService.getSystemPermissions();
  }

  /**
   * GET /api/v1/admin/role-groups
   * Lấy danh sách tất cả các nhóm quyền kèm thống kê số lượng
   * Quyền: ADMIN
   */
  @Get('role-groups')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<RoleGroupsListResponse> {
    return this.roleGroupsService.findAll();
  }

  /**
   * GET /api/v1/admin/role-groups/:id
   * Xem thông tin chi tiết 1 nhóm quyền
   * Quyền: ADMIN
   */
  @Get('role-groups/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RoleGroupDetailResponse> {
    return this.roleGroupsService.findOne(id);
  }

  /**
   * POST /api/v1/admin/role-groups
   * Tạo mới một nhóm quyền
   * Quyền: ADMIN
   */
  @Post('role-groups')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateRoleGroupDto): Promise<RoleGroupMutateResponse> {
    return this.roleGroupsService.create(dto);
  }

  /**
   * PATCH /api/v1/admin/role-groups/:id
   * Cập nhật thông tin hoặc quyền hạn của một nhóm quyền
   * Quyền: ADMIN
   */
  @Patch('role-groups/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleGroupDto,
  ): Promise<RoleGroupMutateResponse> {
    return this.roleGroupsService.update(id, dto);
  }

  /**
   * DELETE /api/v1/admin/role-groups/:id
   * Xóa một nhóm quyền (Nếu không phải system role và không có thành viên gán vào)
   * Quyền: ADMIN
   */
  @Delete('role-groups/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number): Promise<RoleGroupMutateResponse> {
    return this.roleGroupsService.remove(id);
  }
}
