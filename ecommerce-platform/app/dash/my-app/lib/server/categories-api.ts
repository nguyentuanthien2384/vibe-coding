/**
 * Server-side API helper cho Admin Categories.
 * CHỈ dùng trong Server Components, Route Handlers, Server Actions.
 * Đọc token từ cookies() của next/headers.
 */

import { cookies } from 'next/headers';
import { AdminCategoriesListResponse } from '../../features/categories/types/category.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Server-side fetch helper cho Server Components.
 * Lưu ý: Server Components trong Next.js App Router là read-only đối với Cookies.
 * Không xoay (rotate) Refresh Token ở đây để tránh làm mất token của Client.
 * Nếu 401, Server Component ném lỗi và để Client Component tự fetch & refresh token qua Route Handler.
 */
async function serverAdminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_access_token')?.value || cookieStore.get('accessToken')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers,
    cache: options.cache ?? 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Lỗi server' }));
    throw new Error((body as { message?: string }).message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface GetCategoriesServerParams {
  page?: number;
  limit?: number;
}

export const serverCategoriesApi = {
  /**
   * GET /api/v1/admin/categories
   * Gọi từ Server Component để pre-fetch trang đầu tiên.
   */
  getList: (params: GetCategoriesServerParams = {}): Promise<AdminCategoriesListResponse> => {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 10));
    return serverAdminFetch<AdminCategoriesListResponse>(
      `/admin/categories?${query.toString()}`,
    );
  },
};
