import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GetStaffsQueryDto } from './dto/get-staffs-query.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto';
import { UpdateStaffRoleGroupDto } from './dto/update-staff-role-group.dto';
import { UpdateCustomPermissionsDto } from './dto/update-custom-permissions.dto';
import {
  StaffDetailDto,
  StaffDetailResponse,
  StaffListItemDto,
  StaffListResponse,
  StaffMutateResponse,
} from './interfaces/staff.interface';
import { SYSTEM_PERMISSIONS } from './interfaces/role-group.interface';

const ALL_PERMISSION_IDS = SYSTEM_PERMISSIONS.map((p) => p.id);

@Injectable()
export class AdminStaffsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Lấy danh sách nhân viên quản trị (ADMIN, STAFF)
   */
  async findAll(dto: GetStaffsQueryDto): Promise<StaffListResponse> {
    const page = Math.max(1, dto.page || 1);
    const limit = Math.min(50, Math.max(1, dto.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    // Lọc theo vai trò (chỉ lấy ADMIN hoặc STAFF)
    if (dto.role === 'ADMIN') {
      where.role = Role.ADMIN;
    } else if (dto.role === 'STAFF') {
      where.role = Role.STAFF;
    } else {
      where.role = { in: [Role.ADMIN, Role.STAFF] };
    }

    // Lọc theo trạng thái
    if (dto.status === 'ACTIVE') {
      where.isActive = true;
    } else if (dto.status === 'BLOCKED') {
      where.isActive = false;
    }

    // Lọc theo nhóm quyền
    if (dto.roleGroupId) {
      where.roleGroupId = dto.roleGroupId;
    }

    // Tìm kiếm theo từ khóa (Tên, Email, SĐT)
    if (dto.search?.trim()) {
      const q = dto.search.trim();
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: {
          roleGroup: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formattedStaffs: StaffListItemDto[] = users.map((u) => {
      let roleLabel = 'Nhân viên';
      if (u.role === Role.ADMIN) {
        roleLabel = 'Quản trị viên';
      } else if (u.roleGroup?.name) {
        roleLabel = u.roleGroup.name;
      }

      return {
        id: String(u.id),
        numericId: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        role: u.role,
        roleLabel,
        roleGroupId: u.roleGroupId,
        roleGroupName: u.roleGroup?.name || (u.role === Role.ADMIN ? 'Super Admin' : 'Chưa gán nhóm'),
        status: u.isActive ? 'ACTIVE' : 'BLOCKED',
        createdAt: new Intl.DateTimeFormat('vi-VN').format(u.createdAt),
        lastLoginAt: u.lastLoginAt,
      };
    });

    return {
      success: true,
      statusCode: 200,
      data: {
        staffs: formattedStaffs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    };
  }

  /**
   * Xem chi tiết thông tin một nhân viên
   */
  async findOne(idStr: string): Promise<StaffDetailResponse> {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      throw new BadRequestException('ID nhân viên không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roleGroup: true,
      },
    });

    if (!user || user.role === Role.CUSTOMER) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID #${id}`);
    }

    // Tính toán quyền kế thừa
    let inheritedPermissions: string[] = [];
    if (user.role === Role.ADMIN) {
      inheritedPermissions = ALL_PERMISSION_IDS;
    } else if (user.roleGroup?.permissions && Array.isArray(user.roleGroup.permissions)) {
      inheritedPermissions = user.roleGroup.permissions as string[];
    }

    // Đặc quyền bổ sung
    const customPermissions: string[] = Array.isArray(user.customPermissions)
      ? (user.customPermissions as string[])
      : [];

    // Tổng quyền hiệu lực
    const effectivePermissions = Array.from(
      new Set([...inheritedPermissions, ...customPermissions]),
    );

    let roleLabel = 'Nhân viên';
    if (user.role === Role.ADMIN) {
      roleLabel = 'Quản trị viên';
    } else if (user.roleGroup?.name) {
      roleLabel = user.roleGroup.name;
    }

    const detail: StaffDetailDto = {
      id: String(user.id),
      numericId: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      roleLabel,
      roleGroupId: user.roleGroupId,
      roleGroupName: user.roleGroup?.name || (user.role === Role.ADMIN ? 'Super Admin' : 'Chưa gán nhóm'),
      status: user.isActive ? 'ACTIVE' : 'BLOCKED',
      createdAt: new Intl.DateTimeFormat('vi-VN').format(user.createdAt),
      lastLoginAt: user.lastLoginAt,
      inheritedPermissions,
      customPermissions,
      effectivePermissions,
      notes: user.notes,
    };

    return {
      success: true,
      statusCode: 200,
      data: detail,
    };
  }

  /**
   * Tạo tài khoản nhân viên mới
   */
  async create(dto: CreateStaffDto): Promise<StaffMutateResponse> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException(`Email "${email}" đã được đăng ký trong hệ thống.`);
    }

    const plainPassword = dto.password?.trim() || 'Password123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const created = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim() || null,
        role: dto.role || Role.STAFF,
        roleGroupId: dto.roleGroupId || null,
        notes: dto.notes?.trim() || null,
        isActive: true,
      },
      include: {
        roleGroup: true,
      },
    });

    const detailResponse = await this.findOne(String(created.id));

    return {
      success: true,
      statusCode: 201,
      message: 'Tạo tài khoản nhân viên thành công',
      data: detailResponse.data,
    };
  }

  /**
   * Khóa / Mở khóa tài khoản nhân viên (Thu hồi phiên đăng nhập)
   */
  async updateStatus(idStr: string, dto: UpdateStaffStatusDto): Promise<StaffMutateResponse> {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      throw new BadRequestException('ID nhân viên không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID #${id}`);
    }

    const isBlocking = dto.status === 'BLOCKED';

    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: !isBlocking,
        notes: dto.reason ? `${user.notes ? user.notes + '\n' : ''}[${new Date().toLocaleDateString('vi-VN')}] Lý do đổi trạng thái: ${dto.reason}` : user.notes,
      },
    });

    // Nếu Khóa tài khoản -> Thu hồi toàn bộ Refresh Tokens & Đưa mốc blocked vào Redis
    if (isBlocking) {
      await this.redisService.setEx(`auth:blocked_at:${id}`, 60 * 60 * 24 * 7, Date.now().toString());
      await this.redisService.delByPattern(`auth:refresh:${id}:*`);
    } else {
      // Mở khóa -> Xóa cờ blocked
      await this.redisService.del(`auth:blocked_at:${id}`);
    }

    // Xóa cache permissions
    await this.redisService.del(`auth:perms:user:${id}`);

    const detailResponse = await this.findOne(idStr);

    return {
      success: true,
      statusCode: 200,
      message: isBlocking ? 'Đã khóa tài khoản nhân viên và thu hồi phiên đăng nhập' : 'Đã mở khóa tài khoản nhân viên',
      data: detailResponse.data,
    };
  }

  /**
   * Gán / Đổi nhóm quyền cho nhân viên
   */
  async updateRoleGroup(idStr: string, dto: UpdateStaffRoleGroupDto): Promise<StaffMutateResponse> {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      throw new BadRequestException('ID nhân viên không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID #${id}`);
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (dto.role) {
      updateData.role = dto.role;
    }
    if (dto.roleGroupId !== undefined) {
      updateData.roleGroup = dto.roleGroupId ? { connect: { id: dto.roleGroupId } } : { disconnect: true };
    }

    await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Xóa cache quyền
    await this.redisService.del(`auth:perms:user:${id}`);

    const detailResponse = await this.findOne(idStr);

    return {
      success: true,
      statusCode: 200,
      message: 'Cập nhật phân quyền nhân viên thành công',
      data: detailResponse.data,
    };
  }

  /**
   * Cập nhật đặc quyền bổ sung cấp riêng
   */
  async updateCustomPermissions(
    idStr: string,
    dto: UpdateCustomPermissionsDto,
  ): Promise<StaffMutateResponse> {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      throw new BadRequestException('ID nhân viên không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID #${id}`);
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        customPermissions: dto.customPermissions || [],
      },
    });

    // Xóa cache quyền trên Redis để cập nhật quyền mới tức thì
    await this.redisService.del(`auth:perms:user:${id}`);

    const detailResponse = await this.findOne(idStr);

    return {
      success: true,
      statusCode: 200,
      message: 'Thiết lập đặc quyền bổ sung thành công',
      data: detailResponse.data,
    };
  }

  /**
   * Chỉnh sửa thông tin cơ bản nhân viên (Họ tên, SĐT, Ghi chú)
   */
  async update(idStr: string, dto: UpdateStaffDto): Promise<StaffMutateResponse> {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      throw new BadRequestException('ID nhân viên không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID #${id}`);
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName?.trim() || user.fullName,
        phone: dto.phone !== undefined ? dto.phone?.trim() || null : user.phone,
        notes: dto.notes !== undefined ? dto.notes?.trim() || null : user.notes,
      },
    });

    const detailResponse = await this.findOne(idStr);

    return {
      success: true,
      statusCode: 200,
      message: 'Cập nhật thông tin nhân viên thành công',
      data: detailResponse.data,
    };
  }
}
