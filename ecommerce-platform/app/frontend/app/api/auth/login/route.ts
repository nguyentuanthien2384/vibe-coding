import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * POST /api/auth/login
 * Route Handler của Next.js nhận thông tin đăng nhập từ Client,
 * gọi sang NestJS Backend, và set HttpOnly Cookie cho accessToken & refreshToken.
 * TUYỆT ĐỐI KHÔNG lưu hay trả về thông tin user xuống Client dưới dạng Plain Text.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Gọi sang NestJS Backend
    const backendRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      const errorMsg = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Đăng nhập không thành công.';
      return NextResponse.json(
        { message: errorMsg },
        { status: backendRes.status }
      );
    }

    const { accessToken } = data.data;

    // 2. Tạo NextResponse trả về thành công
    const response = NextResponse.json({
      statusCode: 200,
      message: 'Đăng nhập thành công',
    });

    // 3. Set Cookie HttpOnly cho accessToken thông qua Next.js
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 phút (TTL Access Token)
    });

    // 4. Chuyển tiếp Cookie refreshToken từ NestJS nếu có
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
