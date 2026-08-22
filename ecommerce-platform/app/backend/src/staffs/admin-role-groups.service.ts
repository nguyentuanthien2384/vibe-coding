import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateRoleGroupDto } from './dto/create-role-group.dto';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import {
  RoleGroupDetailResponse,
  RoleGroupItem,
  RoleGroupMutateResponse,
  RoleGroupsListResponse,
  SYSTEM_PERMISSIONS,
} from './interfaces/role-group.interface';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class AdminRoleGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Lấy danh mục tất cả quyền hạn có sẵn trong hệ thống
   */
  getSystemPermissions() {
    return {
      success: true,
      statusCode: 200,
      data: SYSTEM_PERMISSIONS,
    };
  }

  /**
   * Lấy danh sách nhóm quyền & Thống kê số lượng
   */
  async findAll(): Promise<RoleGroupsListResponse> {
    const groups = await this.prisma.roleGroup.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
    });

    const totalGroups = groups.length;
    const totalAssignedStaffs = groups.reduce((acc, g) => acc + g._count.users, 0);

    const formattedGroups: RoleGroupItem[] = groups.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      description: g.description,
      isSystem: g.isSystem,
      memberCount: g._count.users,
      permissions: Array.isArray(g.permissions) ? (g.permissions as string[]) : [],
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));

    return {
      success: true,
      statusCode: 200,
      data: {
        stats: {
          totalGroups,
          totalAssignedStaffs,
        },
        roleGroups: formattedGroups,
      },
    };
  }

  /**
   * Xem chi tiết 1 nhóm quyền
   */
  async findOne(id: number): Promise<RoleGroupDetailResponse> {
    const group = await this.prisma.roleGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Không tìm thấy nhóm quyền với ID #${id}`);
    }

    return {
      success: true,
      statusCode: 200,
      data: {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        isSystem: group.isSystem,
        memberCount: group._count.users,
        permissions: Array.isArray(group.permissions) ? (group.permissions as string[]) : [],
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
    };
  }

  /**
   * Tạo nhóm quyền mới
   */
  async create(dto: CreateRoleGroupDto): Promise<RoleGroupMutateResponse> {
    let slug = slugify(dto.name);
    const existing = await this.prisma.roleGroup.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const created = await this.prisma.roleGroup.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description || null,
        isSystem: false,
        permissions: dto.permissions || [],
      },
    });

    return {
      success: true,
      statusCode: 201,
      message: 'Tạo nhóm quyền mới thành công',
      data: {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description,
        isSystem: created.isSystem,
        memberCount: 0,
        permissions: Array.isArray(created.permissions) ? (created.permissions as string[]) : [],
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    };
  }

  /**
   * Cập nhật nhóm quyền
   */
  async update(id: number, dto: UpdateRoleGroupDto): Promise<RoleGroupMutateResponse> {
    const existing = await this.prisma.roleGroup.findUnique({
      where: { id },
      include: { users: { select: { id: true } } },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy nhóm quyền với ID #${id}`);
    }

    const updateData: {
      name?: string;
      description?: string;
      permissions?: string[];
    } = {};

    if (dto.name) {
      if (existing.isSystem && dto.name !== existing.name) {
        throw new BadRequestException('Không thể đổi tên nhóm quyền mặc định của hệ thống');
      }
      updateData.name = dto.name;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.permissions !== undefined) {
      updateData.permissions = dto.permissions;
    }

    const updated = await this.prisma.roleGroup.update({
      where: { id },
      data: updateData,
    });

    // Xóa cache quyền của tất cả nhân viên thuộc nhóm này trên Redis
    if (existing.users.length > 0) {
      const userIds = existing.users.map((u) => u.id);
      for (const uid of userIds) {
        await this.redisService.del(`auth:perms:user:${uid}`);
      }
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Cập nhật nhóm quyền thành công',
      data: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        isSystem: updated.isSystem,
        memberCount: existing.users.length,
        permissions: Array.isArray(updated.permissions) ? (updated.permissions as string[]) : [],
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  }

  /**
   * Xóa nhóm quyền
   */
  async remove(id: number): Promise<RoleGroupMutateResponse> {
    const existing = await this.prisma.roleGroup.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy nhóm quyền với ID #${id}`);
    }

    if (existing.isSystem) {
      throw new BadRequestException('Không thể xóa nhóm quyền mặc định của hệ thống');
    }

    if (existing._count.users > 0) {
      throw new BadRequestException(
        `Không thể xóa nhóm quyền đang có ${existing._count.users} nhân viên được gán. Vui lòng chuyển nhân sự sang nhóm khác trước.`,
      );
    }

    await this.prisma.roleGroup.delete({ where: { id } });

    return {
      success: true,
      statusCode: 200,
      message: 'Đã xóa nhóm quyền thành công',
    };
  }
}
