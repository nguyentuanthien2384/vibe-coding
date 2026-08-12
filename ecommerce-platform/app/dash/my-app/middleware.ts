import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware bảo vệ toàn bộ tuyến đường Admin Dashboard (app/dash/my-app).
 * Nếu người dùng không có accessToken lẫn refreshToken trong cookie -> chuyển
 * đến trang đăng nhập nội bộ của dashboard.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua static files, _next, favicon và các route API nội bộ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/login' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const accessToken =
    request.cookies.get('admin_access_token')?.value ||
    request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Nếu không có token nào trong Cookie -> Phiên đăng nhập không tồn tại.
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
