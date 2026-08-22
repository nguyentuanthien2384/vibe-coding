import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminStaffsService } from './admin-staffs.service';
import { GetStaffsQueryDto } from './dto/get-staffs-query.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto';
import { UpdateStaffRoleGroupDto } from './dto/update-staff-role-group.dto';
import { UpdateCustomPermissionsDto } from './dto/update-custom-permissions.dto';
import {
  StaffDetailResponse,
  StaffListResponse,
  StaffMutateResponse,
} from './interfaces/staff.interface';

@Controller('admin/staffs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminStaffsController {
  constructor(private readonly staffsService: AdminStaffsService) {}

  /**
   * GET /api/v1/admin/staffs
   * Lấy danh sách nhân viên quản trị (Lọc, tìm kiếm, phân trang)
   * Quyền: ADMIN
   */
  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: GetStaffsQueryDto): Promise<StaffListResponse> {
    return this.staffsService.findAll(query);
  }

  /**
   * GET /api/v1/admin/staffs/:id
   * Xem thông tin chi tiết một nhân viên (Profile, nhóm quyền, đặc quyền)
   * Quyền: ADMIN
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<StaffDetailResponse> {
    return this.staffsService.findOne(id);
  }

  /**
   * POST /api/v1/admin/staffs
   * Tạo tài khoản nhân viên mới
   * Quyền: ADMIN
   */
  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStaffDto): Promise<StaffMutateResponse> {
    return this.staffsService.create(dto);
  }

  /**
   * PATCH /api/v1/admin/staffs/:id/status
   * Khóa hoặc Mở khóa tài khoản nhân viên (Revoke Tokens khi khóa)
   * Quyền: ADMIN
   */
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStaffStatusDto,
  ): Promise<StaffMutateResponse> {
    return this.staffsService.updateStatus(id, dto);
  }

  /**
   * PATCH /api/v1/admin/staffs/:id/role-group
   * Gán hoặc thay đổi nhóm quyền cho nhân viên
   * Quyền: ADMIN
   */
  @Patch(':id/role-group')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  updateRoleGroup(
    @Param('id') id: string,
    @Body() dto: UpdateStaffRoleGroupDto,
  ): Promise<StaffMutateResponse> {
    return this.staffsService.updateRoleGroup(id, dto);
  }

  /**
   * PATCH /api/v1/admin/staffs/:id/custom-permissions
   * Thiết lập danh sách đặc quyền cấp riêng cho nhân viên
   * Quyền: ADMIN
   */
  @Patch(':id/custom-permissions')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  updateCustomPermissions(
    @Param('id') id: string,
    @Body() dto: UpdateCustomPermissionsDto,
  ): Promise<StaffMutateResponse> {
    return this.staffsService.updateCustomPermissions(id, dto);
  }

  /**
   * PATCH /api/v1/admin/staffs/:id
   * Chỉnh sửa thông tin cơ bản nhân viên (Họ tên, SĐT, Ghi chú)
   * Quyền: ADMIN
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ): Promise<StaffMutateResponse> {
    return this.staffsService.update(id, dto);
  }
}
