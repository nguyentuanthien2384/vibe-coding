import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { JwtPayload } from '../interfaces/auth-response.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Yêu cầu xác thực tài khoản');
    }

    // 1. Quản trị viên tối cao (Super Admin) có toàn quyền
    if (user.role === Role.ADMIN) {
      return true;
    }

    // 2. Nếu không phải STAFF hoặc ADMIN -> Không có quyền truy cập quản trị
    if (user.role !== Role.STAFF) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
    }

    // 3. Lấy danh sách quyền của STAFF từ Redis hoặc Database
    let permissions: string[] = [];
    const cachedPerms = await this.redisService.get(`auth:perms:user:${user.sub}`);

    if (cachedPerms) {
      try {
        permissions = JSON.parse(cachedPerms);
      } catch {
        permissions = [];
      }
    }

    if (!cachedPerms || permissions.length === 0) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.sub },
        include: { roleGroup: true },
      });

      if (!dbUser || !dbUser.isActive) {
        throw new ForbiddenException('Tài khoản đã bị khóa hoặc không tồn tại');
      }

      const inherited =
        dbUser.roleGroup?.permissions && Array.isArray(dbUser.roleGroup.permissions)
          ? (dbUser.roleGroup.permissions as string[])
          : [];
      const custom = Array.isArray(dbUser.customPermissions)
        ? (dbUser.customPermissions as string[])
        : [];

      permissions = Array.from(new Set([...inherited, ...custom]));

      // Cache lại trong Redis 1 giờ (3600s)
      await this.redisService.setEx(
        `auth:perms:user:${user.sub}`,
        3600,
        JSON.stringify(permissions),
      );
    }

    // 4. Kiểm tra quyền '*' hoặc khớp ít nhất 1 quyền yêu cầu
    if (permissions.includes('*')) {
      return true;
    }

    const hasPermission = requiredPermissions.some((perm) =>
      permissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện chức năng này (Yêu cầu quyền: ${requiredPermissions.join(', ')})`,
      );
    }

    return true;
  }
}
