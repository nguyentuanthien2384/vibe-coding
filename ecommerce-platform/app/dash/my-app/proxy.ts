import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/login' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const accessToken =
    request.cookies.get('admin_access_token')?.value || request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

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
