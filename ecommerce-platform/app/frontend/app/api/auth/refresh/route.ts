import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * POST /api/auth/refresh
 * Route Handler của Next.js nhận yêu cầu làm mới token từ Client,
 * chuyển tiếp sang NestJS Backend (/api/v1/auth/refresh-token),
 * và cập nhật HttpOnly Cookie cho accessToken & refreshToken mới.
 */
export async function POST() {
  try {
    // 1. Lấy refreshToken từ Cookie của Request sử dụng cookies()
    const cookieStore = await cookies();
    const refreshTokenFromCookie = cookieStore.get('refreshToken')?.value;

    if (!refreshTokenFromCookie) {
      const errorRes = NextResponse.json(
        { message: 'Refresh token không tồn tại. Vui lòng đăng nhập lại.' },
        { status: 401 }
      );
      errorRes.cookies.delete('accessToken');
      errorRes.cookies.delete('refreshToken');
      return errorRes;
    }

    // 2. Gọi sang NestJS Backend chỉ truyền đúng Cookie refreshToken
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

      // Xóa Cookie rác khi refresh không thành công
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    const { accessToken } = data.data;

    // 3. Tạo NextResponse trả về thành công
    const response = NextResponse.json({
      statusCode: 200,
      message: 'Làm mới phiên đăng nhập thành công',
      data: { accessToken },
    });

    // 4. Set Cookie HttpOnly cho accessToken mới
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 phút (TTL Access Token)
    });

    // 5. Chuyển tiếp Cookie refreshToken mới từ NestJS nếu có (Refresh Token Rotation)
    const backendCookies = backendRes.headers.getSetCookie();
    if (backendCookies && backendCookies.length > 0) {
      for (const cookieStr of backendCookies) {
        response.headers.append('Set-Cookie', cookieStr);
      }
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi kết nối máy chủ';
    const errorRes = NextResponse.json({ message }, { status: 500 });
    return errorRes;
  }
}
