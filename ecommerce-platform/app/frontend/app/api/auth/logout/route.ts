import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Route Handler xóa HttpOnly Cookies (accessToken, refreshToken)
 */
export async function POST() {
  const response = NextResponse.json({
    statusCode: 200,
    message: 'Đã đăng xuất thành công',
  });

  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');

  return response;
}
