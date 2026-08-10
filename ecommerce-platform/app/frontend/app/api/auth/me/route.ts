import { NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../lib/server-api';
import { UserProfile } from '../../../../types/auth.types';

/**
 * GET /api/auth/me
 * Route Handler BFF của Next.js lấy thông tin tài khoản từ NestJS Backend (/api/v1/auth/me).
 * Tự động sử dụng serverApiFetch để bắt 401 Unauthorized và tự động refresh token nếu accessToken bị sai/hết hạn.
 */
export async function GET() {
  try {
    const data = await serverApiFetch<{
      statusCode: number;
      message: string;
      data: UserProfile;
    }>('/api/v1/auth/me');

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Phiên đăng nhập hết hạn hoặc chưa đăng nhập';
    return NextResponse.json(
      { message },
      { status: 401 }
    );
  }
}
