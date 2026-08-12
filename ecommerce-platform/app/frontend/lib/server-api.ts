// lib/server-api.ts
// Server-side Fetch Interceptor dành riêng cho Next.js Server Components, Server Actions & Route Handlers
// Tự động bắt 401 Unauthorized, gọi sang NestJS để refresh token và cập nhật cookies() của Next.js

import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/** Keeps the backend HTTP status available to Next.js route handlers. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Helper parse giá trị Cookie từ chuỗi Header Set-Cookie
 */
function parseCookieValue(setCookieHeader: string, cookieName: string): string | null {
  const match = setCookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Custom fetch wrapper chạy trên Server Node.js (Next Server) hỗ trợ Refresh Token tự động.
 */
export async function serverApiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const url = path.startsWith('http://') || path.startsWith('https://')
    ? path
    : `${API_BASE}${path}`;

  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // 1. Thử gửi request ban đầu sang NestJS Backend
  let res = await fetch(url, {
    ...options,
    headers,
  });

  // 2. Nếu trả về 401 Unauthorized và có refreshToken -> Tiến hành Refresh Token phía Server
  if (res.status === 401 && refreshToken && !path.includes('/api/v1/auth/')) {
    try {
      const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refreshToken=${refreshToken}`,
        },
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData.data?.accessToken;

        if (newAccessToken) {
          accessToken = newAccessToken;

          // Cập nhật Cookie HttpOnly cho Next.js Server Context
          try {
            cookieStore.set('accessToken', newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 15 * 60,
            });

            const setCookieHeaders = refreshRes.headers.getSetCookie();
            if (setCookieHeaders && setCookieHeaders.length > 0) {
              for (const headerStr of setCookieHeaders) {
                const newRefreshToken = parseCookieValue(headerStr, 'refreshToken');
                if (newRefreshToken) {
                  cookieStore.set('refreshToken', newRefreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60,
                  });
                }
              }
            }
          } catch {
            // Trường hợp Server Component Read-only, tiếp tục retry với newAccessToken
          }

          // Retry lại request ban đầu với Authorization header mới
          const retryHeaders = new Headers(options?.headers);
          retryHeaders.set('Content-Type', 'application/json');
          retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);

          res = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });
        }
      } else {
        // Refresh token hết hạn -> Xóa cookies
        try {
          cookieStore.delete('accessToken');
          cookieStore.delete('refreshToken');
        } catch {
          // Ignores if read-only context
        }
      }
    } catch (err) {
      console.error('Lỗi refresh token trên Next Server:', err);
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMsg = errorData?.message || `API error ${res.status}: ${url}`;
    throw new ApiRequestError(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
      res.status,
    );
  }

  return res.json() as Promise<T>;
}
