import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * POST /api/auth/refresh
 * Next.js Route Handler cho Dashboard Admin:
 * Đọc refreshToken từ Cookie, gửi tới NestJS Backend (/api/v1/auth/refresh-token),
 * và cập nhật Cookie HttpOnly cho accessToken & refreshToken mới.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshTokenFromCookie = cookieStore.get('refreshToken')?.value;

    if (!refreshTokenFromCookie) {
      const errorRes = NextResponse.json(
        { message: 'Refresh token không tồn tại. Vui lòng đăng nhập lại.' },
        { status: 401 }
      );
      errorRes.cookies.delete('accessToken');
      errorRes.cookies.delete('admin_access_token');
      errorRes.cookies.delete('refreshToken');
      return errorRes;
    }

    const backendRes = await fetch(`${API_BASE}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshTokenFromCookie}`,
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      const errorMsg = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Phiên đăng nhập hết hạn hoặc token không hợp lệ.';

      const response = NextResponse.json(
        { message: errorMsg },
        { status: backendRes.status }
      );

      response.cookies.delete('accessToken');
      response.cookies.delete('admin_access_token');
      response.cookies.delete('refreshToken');
      return response;
    }

    const { accessToken } = data.data;

    const response = NextResponse.json({
      statusCode: 200,
      message: 'Làm mới phiên đăng nhập thành công',
      data: { accessToken },
    });

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    response.cookies.set('admin_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    const backendCookies = backendRes.headers.getSetCookie();
    if (backendCookies && backendCookies.length > 0) {
      for (const cookieStr of backendCookies) {
        response.headers.append('Set-Cookie', cookieStr);
      }
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi kết nối máy chủ';
    return NextResponse.json({ message }, { status: 500 });
  }
}
