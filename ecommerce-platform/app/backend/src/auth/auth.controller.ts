import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type {
  ApiResponse,
  AuthUserResponse,
  JwtPayload,
} from './interfaces/auth-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   * Đăng ký tài khoản người dùng mới (Role: CUSTOMER)
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<{ accessToken: string; user: AuthUserResponse }>> {
    const result = await this.authService.register(dto);

    // Set Refresh Token vào Cookie HttpOnly
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sevenDaysMs,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Đăng ký tài khoản thành công',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }

  /**
   * POST /api/v1/auth/login
   * Đăng nhập hệ thống (Email + Password)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<{ accessToken: string; user: AuthUserResponse }>> {
    const result = await this.authService.login(dto);

    // Set Refresh Token vào Cookie HttpOnly
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sevenDaysMs,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng nhập thành công',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }

  /**
   * POST /api/v1/auth/refresh-token
   * Đổi Access Token mới từ Refresh Token trong Cookie (Refresh Token Rotation)
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<{ accessToken: string }>> {
    const refreshTokenStr = req.cookies?.refreshToken;
    const result = await this.authService.refreshToken(refreshTokenStr);

    // Set Refresh Token mới vào Cookie HttpOnly
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sevenDaysMs,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Làm mới phiên đăng nhập thành công',
      data: {
        accessToken: result.accessToken,
      },
    };
  }

  /**
   * POST /api/v1/auth/logout
   * Đăng xuất người dùng (Blacklist Access Token & Clear Cookie)
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    const refreshTokenStr = req.cookies?.refreshToken;
    await this.authService.logout(user, refreshTokenStr);

    // Xóa Cookie phía Client
    res.clearCookie('refreshToken', {
      path: '/',
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng xuất thành công',
    };
  }

  /**
   * GET /api/v1/auth/me
   * Lấy thông tin tài khoản người dùng hiện tại
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @CurrentUser('sub') userId: number,
  ): Promise<ApiResponse<AuthUserResponse>> {
    const user = await this.authService.getProfile(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin tài khoản thành công',
      data: user,
    };
  }

  /**
   * PATCH /api/v1/auth/profile
   * Cập nhật thông tin hồ sơ cá nhân người dùng
   */
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser('sub') userId: number,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponse<AuthUserResponse>> {
    const updatedUser = await this.authService.updateProfile(userId, dto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật thông tin cá nhân thành công',
      data: updatedUser,
    };
  }

  /**
   * PATCH /api/v1/auth/change-password
   * Đổi mật khẩu người dùng & Thu hồi toàn bộ token cũ
   */
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async changePassword(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    await this.authService.changePassword(currentUser.sub, dto, currentUser);

    // Xóa Cookie Refresh Token phía Client
    res.clearCookie('refreshToken', {
      path: '/',
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Đổi mật khẩu thành công. Tất cả phiên đăng nhập cũ đã được thu hồi',
    };
  }
}
