import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { JwtPayload } from '../interfaces/auth-response.interface';

function cookieExtractor(req: any): string | null {
  if (req && req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'techbite-ecommerce-jwt-access-secret-2026',
    });
  }

  /**
   * Validate Access Token & Kiểm tra Blacklist trên Redis
   * Tuân thủ AGENTS.md: Middleware check Blacklist trên Redis với auth:blacklist:<jti>
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload || !payload.jti || !payload.sub) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    // 1. Check Redis Blacklist (Thu hồi Access Token đơn lẻ / Logout)
    const isBlacklisted = await this.redisService.get(`auth:blacklist:${payload.jti}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token đã bị vô hiệu hóa');
    }

    // 2. Check mốc thời gian Đổi Mật Khẩu (Vô hiệu hóa TOÀN BỘ Access Token cũ trên mọi trình duyệt/thiết bị)
    const passwordChangedAtStr = await this.redisService.get(`auth:password_changed:${payload.sub}`);
    if (passwordChangedAtStr) {
      const passwordChangedAt = parseInt(passwordChangedAtStr, 10);
      const tokenIat = payload.iat ?? 0;

      if (tokenIat < passwordChangedAt) {
        throw new UnauthorizedException('Mật khẩu tài khoản đã được thay đổi. Vui lòng đăng nhập lại');
      }
    }

    // 3. Check mốc Khóa Tài Khoản trên Redis (auth:blocked_at:<userId>)
    const isBlocked = await this.redisService.get(`auth:blocked_at:${payload.sub}`);
    if (isBlocked) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    // 4. Kiểm tra trực tiếp trạng thái User trong Database (Chặn tuyệt đối tài khoản bị khóa)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      // Đưa cờ blocked vào Redis và thu hồi toàn bộ refresh token
      await this.redisService.setEx(`auth:blocked_at:${payload.sub}`, 60 * 60 * 24 * 7, '1');
      await this.redisService.delByPattern(`auth:refresh:${payload.sub}:*`);
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    return payload;
  }
}

