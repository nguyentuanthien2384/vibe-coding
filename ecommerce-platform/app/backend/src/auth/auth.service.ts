import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  AuthUserResponse,
  JwtPayload,
  JwtRefreshPayload,
  LoginResult,
  RefreshTokenResult,
  RegisterResult,
} from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Đăng ký tài khoản người dùng mới (Role mặc định: CUSTOMER)
   */
  async register(dto: RegisterDto): Promise<RegisterResult> {
    const { email, password, confirmPassword, fullName, phone } = dto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Xác nhận mật khẩu không trùng khớp với mật khẩu đã nhập');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(`Email "${email}" đã được đăng ký trên hệ thống`);
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone: phone || null,
        role: Role.CUSTOMER,
        isActive: true,
      },
    });

    const accessJti = this.generateJti();
    const refreshJti = this.generateJti();

    const accessPayload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      jti: accessJti,
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: newUser.id,
      jti: refreshJti,
    };

    const jwtSecret = process.env.JWT_SECRET || 'techbite-ecommerce-jwt-access-secret-2026';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'techbite-ecommerce-jwt-refresh-secret-2026';

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: jwtSecret,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    const refreshTtlSeconds = 7 * 24 * 60 * 60;
    const redisKey = `auth:refresh:${newUser.id}:${refreshJti}`;
    await this.redisService.setEx(redisKey, refreshTtlSeconds, 'active');

    this.logger.log(`✅ Đăng ký người dùng thành công: User ID ${newUser.id} (${newUser.email})`);

    const userResponse: AuthUserResponse = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      phone: newUser.phone,
      avatarUrl: newUser.avatarUrl,
      role: newUser.role,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
    };

    return {
      accessToken,
      refreshToken,
      user: userResponse,
    };
  }

  /**
   * Đăng nhập hệ thống (Xác thực Email, Mật khẩu bcrypt, Cấp Token & Cập nhật lastLoginAt)
   */
  async login(dto: LoginDto): Promise<LoginResult> {
    const { email, password } = dto;

    // 1. Tìm user theo Email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // 2. Kiểm tra trạng thái kích hoạt tài khoản
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị tạm khóa. Vui lòng liên hệ quản trị viên');
    }

    // 3. So sánh Mật khẩu Hash (bcrypt)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // 4. Sinh JTI cho Tokens
    const accessJti = this.generateJti();
    const refreshJti = this.generateJti();

    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: accessJti,
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      jti: refreshJti,
    };

    const jwtSecret = process.env.JWT_SECRET || 'techbite-ecommerce-jwt-access-secret-2026';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'techbite-ecommerce-jwt-refresh-secret-2026';

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: jwtSecret,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    // 5. Lưu Refresh JTI vào Redis (7 ngày = 604,800s)
    const refreshTtlSeconds = 7 * 24 * 60 * 60;
    const redisKey = `auth:refresh:${user.id}:${refreshJti}`;
    await this.redisService.setEx(redisKey, refreshTtlSeconds, 'active');

    // 6. Cập nhật lastLoginAt ngầm
    const lastLoginAt = new Date();
    this.prisma.user
      .update({
        where: { id: user.id },
        data: { lastLoginAt },
      })
      .catch((err) => this.logger.error(`Cập nhật lastLoginAt thất bại: ${err.message}`));

    this.logger.log(`✅ Người dùng đăng nhập thành công: User ID ${user.id} (${user.email})`);

    const userResponse: AuthUserResponse = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt,
    };

    return {
      accessToken,
      refreshToken,
      user: userResponse,
    };
  }

  /**
   * Cấp lại Access Token & Refresh Token mới (Refresh Token Rotation)
   * Chống Replay Attack: Nếu phát hiện Refresh Token cũ/đã thu hồi -> Xóa toàn bộ token của User
   */
  async refreshToken(refreshTokenStr: string): Promise<RefreshTokenResult> {
    if (!refreshTokenStr) {
      throw new UnauthorizedException('Refresh token không được để trống');
    }

    let payload: JwtRefreshPayload;
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'techbite-ecommerce-jwt-refresh-secret-2026';

    try {
      payload = this.jwtService.verify<JwtRefreshPayload>(refreshTokenStr, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập hết hạn hoặc token không hợp lệ');
    }

    const { sub: userId, jti: oldRefreshJti } = payload;
    const redisKey = `auth:refresh:${userId}:${oldRefreshJti}`;

    // 1. Kiểm tra tồn tại trong Redis
    const isSessionActive = await this.redisService.get(redisKey);

    if (!isSessionActive) {
      // ⚠️ CẢNH BÁO BẢO MẬT REPLAY ATTACK: Token này đã bị dùng lại hoặc bị thu hồi từ trước!
      this.logger.warn(`🚨 REPLAY ATTACK DETECTED for User ID ${userId}! Thu hồi toàn bộ phiên đăng nhập.`);
      await this.redisService.delByPattern(`auth:refresh:${userId}:*`);
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi. Vui lòng đăng nhập lại');
    }

    // 2. Thu hồi Refresh Token cũ
    await this.redisService.del(redisKey);

    // 3. Kiểm tra thông tin User trong DB
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị tạm khóa');
    }

    // 4. Sinh cặp Tokens mới
    const newAccessJti = this.generateJti();
    const newRefreshJti = this.generateJti();

    const jwtSecret = process.env.JWT_SECRET || 'techbite-ecommerce-jwt-access-secret-2026';

    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: newAccessJti,
    };

    const newRefreshPayload: JwtRefreshPayload = {
      sub: user.id,
      jti: newRefreshJti,
    };

    const newAccessToken = this.jwtService.sign(accessPayload, {
      secret: jwtSecret,
      expiresIn: '15m',
    });

    const newRefreshToken = this.jwtService.sign(newRefreshPayload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    // 5. Lưu Refresh JTI mới vào Redis (7 ngày)
    const refreshTtlSeconds = 7 * 24 * 60 * 60;
    const newRedisKey = `auth:refresh:${user.id}:${newRefreshJti}`;
    await this.redisService.setEx(newRedisKey, refreshTtlSeconds, 'active');

    this.logger.log(`🔄 Refresh Token thành công cho User ID ${user.id}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Đăng xuất hệ thống (Đưa Access Token vào Redis Blacklist + Xóa Refresh Token)
   */
  async logout(currentUser: JwtPayload, refreshTokenStr?: string): Promise<void> {
    // 1. Đưa Access Token vào Redis Blacklist với TTL là thời gian còn lại của Token
    if (currentUser && currentUser.jti) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const remainingTtl = currentUser.exp ? currentUser.exp - nowSeconds : 900;

      if (remainingTtl > 0) {
        await this.redisService.setEx(`auth:blacklist:${currentUser.jti}`, remainingTtl, 'true');
        this.logger.log(`⛔ Đưa Access Token JTI ${currentUser.jti} vào Blacklist (TTL: ${remainingTtl}s)`);
      }
    }

    // 2. Xóa Refresh Token trong Redis nếu có
    if (refreshTokenStr) {
      const refreshSecret = process.env.JWT_REFRESH_SECRET || 'techbite-ecommerce-jwt-refresh-secret-2026';
      try {
        const payload = this.jwtService.verify<JwtRefreshPayload>(refreshTokenStr, { secret: refreshSecret });
        if (payload && payload.jti && payload.sub) {
          await this.redisService.del(`auth:refresh:${payload.sub}:${payload.jti}`);
        }
      } catch {
        // Token có thể đã hết hạn, xóa rác theo user nếu có
        if (currentUser?.sub) {
          await this.redisService.delByPattern(`auth:refresh:${currentUser.sub}:*`);
        }
      }
    } else if (currentUser?.sub) {
      await this.redisService.delByPattern(`auth:refresh:${currentUser.sub}:*`);
    }

    this.logger.log(`🚪 Người dùng User ID ${currentUser?.sub} đã đăng xuất thành công`);
  }

  /**
   * Lấy thông tin tài khoản cá nhân hiện tại
   */
  async getProfile(userId: number): Promise<AuthUserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị tạm khóa');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Cập nhật thông tin hồ sơ cá nhân (Họ tên, Số điện thoại, Ảnh đại diện)
   */
  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<AuthUserResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser || !existingUser.isActive) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị tạm khóa');
    }

    const updateData: { fullName?: string; phone?: string | null; avatarUrl?: string | null } = {};

    if (dto.fullName !== undefined) {
      updateData.fullName = dto.fullName.trim();
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone ? dto.phone.trim() : null;
    }
    if (dto.avatarUrl !== undefined) {
      updateData.avatarUrl = dto.avatarUrl ? dto.avatarUrl.trim() : null;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    this.logger.log(`✏️ Cập nhật thông tin hồ sơ thành công cho User ID ${userId} (${updatedUser.email})`);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      lastLoginAt: updatedUser.lastLoginAt,
    };
  }

  /**
   * Đổi mật khẩu người dùng (Xác thực mật khẩu cũ + Mã hóa bcrypt mật khẩu mới + Thu hồi toàn bộ Access/Refresh Token)
   */
  async changePassword(userId: number, dto: ChangePasswordDto, currentUser?: JwtPayload): Promise<void> {
    const { oldPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Xác nhận mật khẩu mới không trùng khớp với mật khẩu mới đã nhập');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị tạm khóa');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    const nowSeconds = Math.floor(Date.now() / 1000);

    // 1. Đưa Access Token hiện tại vào Redis Blacklist nếu có JTI
    if (currentUser && currentUser.jti) {
      const remainingTtl = currentUser.exp ? currentUser.exp - nowSeconds : 900;
      if (remainingTtl > 0) {
        await this.redisService.setEx(`auth:blacklist:${currentUser.jti}`, remainingTtl, 'true');
        this.logger.log(`⛔ Đưa Access Token JTI ${currentUser.jti} vào Blacklist do đổi mật khẩu (TTL: ${remainingTtl}s)`);
      }
    }

    // 2. Đặt mốc thời gian passwordChangedAt trên Redis (TTL: 15 phút = 900s)
    // Vô hiệu hóa ngay lập tức mọi Access Token tạo trước mốc thời gian này trên MỌI trình duyệt/thiết bị
    const maxAccessTokenTtlSeconds = 15 * 60;
    await this.redisService.setEx(`auth:password_changed:${userId}`, maxAccessTokenTtlSeconds, nowSeconds.toString());
    this.logger.log(`⏰ Thiết lập mốc thời gian đổi mật khẩu auth:password_changed:${userId} = ${nowSeconds}`);

    // 3. Xóa toàn bộ Refresh Token của User trong Redis trên mọi trình duyệt
    await this.redisService.delByPattern(`auth:refresh:${userId}:*`);
    this.logger.log(`🧹 Đã thu hồi toàn bộ Refresh Tokens trong Redis cho User ID ${userId}`);

    this.logger.log(`🔑 Đổi mật khẩu thành công cho User ID ${userId} (${user.email})`);
  }

  private generateJti(): string {
    return randomUUID();
  }
}
