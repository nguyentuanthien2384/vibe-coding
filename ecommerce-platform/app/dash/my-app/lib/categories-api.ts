/**
 * API client cho Admin Categories module.
 * Base URL đọc từ env NEXT_PUBLIC_API_URL (default: http://localhost:3001).
 * Tất cả request đều đính kèm accessToken từ cookie qua header Authorization.
 */

import {
  AdminCategoriesListResponse,
  AdminCategoryMutateResponse,
  CategoryFormData,
} from '../features/categories/types/category.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAccessToken(): Promise<string | null> {
  // Trong dash app, token được lưu vào localStorage sau khi admin đăng nhập
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();
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
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Lỗi không xác định' }));
    throw new Error(
      (errorBody as { message?: string }).message || `HTTP ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

export interface GetCategoriesParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const categoriesApi = {
  /**
   * GET /api/v1/admin/categories
   */
  getList: (params: GetCategoriesParams = {}): Promise<AdminCategoriesListResponse> => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return adminFetch<AdminCategoriesListResponse>(
      `/admin/categories${qs ? `?${qs}` : ''}`,
    );
  },

  /**
   * POST /api/v1/admin/categories
   */
  create: (data: CategoryFormData): Promise<AdminCategoryMutateResponse> =>
    adminFetch<AdminCategoryMutateResponse>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        slug: data.slug || undefined,
        iconUrl: data.iconUrl || undefined,
        parentId: data.parentId ?? undefined,
        isActive: data.isActive,
      }),
    }),

  /**
   * PATCH /api/v1/admin/categories/:id
   */
  update: (id: number, data: CategoryFormData): Promise<AdminCategoryMutateResponse> =>
    adminFetch<AdminCategoryMutateResponse>(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: data.name,
        slug: data.slug || undefined,
        iconUrl: data.iconUrl || undefined,
        parentId: data.parentId ?? undefined,
        isActive: data.isActive,
      }),
    }),

  /**
   * DELETE /api/v1/admin/categories/:id
   */
  delete: (id: number): Promise<{ statusCode: number; message: string }> =>
    adminFetch<{ statusCode: number; message: string }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    }),
};
