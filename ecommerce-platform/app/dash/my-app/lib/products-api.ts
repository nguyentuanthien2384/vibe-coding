/**
 * API client cho Admin Products module.
 * Base URL đọc từ env NEXT_PUBLIC_API_URL (default: http://localhost:3001).
 * Tất cả request đều đính kèm accessToken từ localStorage/cookie qua header Authorization.
 */

import {
  AdminProductDetailResponse,
  AdminProductListResponse,
  AdminProductMutateResponse,
  ProductFormData,
} from '../features/products/types/product.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAccessToken(): Promise<string | null> {
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
    const errorBody = await res.json().catch(() => ({ message: 'Lỗi hệ thống' }));
    throw new Error(
      (errorBody as { message?: string }).message || `HTTP ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

export interface GetAdminProductsParams {
  search?: string;
  categoryId?: number;
  status?: string;
  stockStatus?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export const productsApi = {
  /**
   * GET /api/v1/admin/products
   */
  getList: (params: GetAdminProductsParams = {}): Promise<AdminProductListResponse> => {
    const query = new URLSearchParams();
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.categoryId && params.categoryId > 0) query.set('categoryId', String(params.categoryId));
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.stockStatus && params.stockStatus !== 'ALL') query.set('stockStatus', params.stockStatus);
    if (typeof params.isFeatured === 'boolean') query.set('isFeatured', String(params.isFeatured));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const qs = query.toString();
    return adminFetch<AdminProductListResponse>(
      `/admin/products${qs ? `?${qs}` : ''}`,
    );
  },

  /**
   * GET /api/v1/admin/products/:id
   */
  getOne: (id: number): Promise<AdminProductDetailResponse> => {
    return adminFetch<AdminProductDetailResponse>(`/admin/products/${id}`);
  },

  /**
   * POST /api/v1/admin/products
   */
  create: (data: ProductFormData): Promise<AdminProductMutateResponse> => {
    return adminFetch<AdminProductMutateResponse>('/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        slug: data.slug || undefined,
        categoryId: Number(data.categoryId),
        price: Number(data.price),
        salePrice: data.salePrice ? Number(data.salePrice) : null,
        stock: Number(data.stock),
        imageUrl: data.imageUrl,
        images: data.images || undefined,
        isFeatured: data.isFeatured,
        isActive: data.status === 'ACTIVE',
        shortDescription: data.shortDescription || undefined,
        longDescription: data.longDescription || undefined,
      }),
    });
  },

  /**
   * PATCH /api/v1/admin/products/:id
   */
  update: (id: number, data: Partial<ProductFormData>): Promise<AdminProductMutateResponse> => {
    return adminFetch<AdminProductMutateResponse>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: data.name,
        slug: data.slug || undefined,
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
        price: data.price !== undefined ? Number(data.price) : undefined,
        salePrice: data.salePrice !== undefined ? (data.salePrice ? Number(data.salePrice) : null) : undefined,
        stock: data.stock !== undefined ? Number(data.stock) : undefined,
        imageUrl: data.imageUrl,
        images: data.images !== undefined ? data.images : undefined,
        isFeatured: data.isFeatured,
        isActive: data.status !== undefined ? data.status === 'ACTIVE' : undefined,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
      }),
    });
  },

  /**
   * DELETE /api/v1/admin/products/:id
   */
  delete: (id: number): Promise<{ statusCode: number; message: string }> => {
    return adminFetch<{ statusCode: number; message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },
};
