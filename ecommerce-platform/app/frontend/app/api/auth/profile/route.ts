import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../lib/server-api';
import { UserProfile } from '../../../../types/auth.types';

/**
 * PATCH /api/auth/profile
 * Route Handler BFF của Next.js cập nhật thông tin người dùng sang NestJS Backend (/api/v1/auth/profile).
 * Tự động truyền HttpOnly Cookie accessToken thông qua serverApiFetch và refresh token nếu bị hết hạn.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await serverApiFetch<{
      statusCode: number;
      message: string;
      data: UserProfile;
    }>('/api/v1/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cập nhật thông tin cá nhân không thành công.';
    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}
