import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverApiFetch } from '../../../../lib/server-api';

/**
 * POST /api/auth/change-password
 * Route Handler BFF của Next.js đổi mật khẩu người dùng sang NestJS Backend (/api/v1/auth/change-password).
 * Khi thành công: Thu hồi và xóa toàn bộ HttpOnly Cookies trên Next.js Server context.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await serverApiFetch<{
      statusCode: number;
      message: string;
    }>('/api/v1/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    const cookieStore = await cookies();
    try {
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
    } catch {
      // Ignore if read-only context
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.';
    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}
