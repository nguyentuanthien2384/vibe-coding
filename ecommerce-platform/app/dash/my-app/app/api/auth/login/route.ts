import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json();

    if (!backendRes.ok) {
      const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Đăng nhập không thành công.';
      return NextResponse.json({ message }, { status: backendRes.status });
    }

    const { accessToken, user } = data.data;
    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      return NextResponse.json(
        { message: 'Tài khoản này không có quyền truy cập trang quản trị.' },
        { status: 403 },
      );
    }

    const response = NextResponse.json({
      statusCode: 200,
      message: 'Đăng nhập thành công.',
      data: { accessToken },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 15 * 60,
    };
    response.cookies.set('accessToken', accessToken, cookieOptions);
    response.cookies.set('admin_access_token', accessToken, cookieOptions);

    for (const cookie of backendRes.headers.getSetCookie()) {
      response.headers.append('Set-Cookie', cookie);
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Không thể kết nối tới máy chủ.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
