// lib/home.ts
// Server-side data fetching functions cho Home Page

import { apiFetch, ApiResponse, ApiResponseWithPagination } from './api';

// ─── Types khớp với Backend response ──────────────────────────────────────────

export type BannerType = 'HERO_BANNER' | 'PROMOTION_BANNER' | 'SOCIAL_PROOF';

export interface BannerItem {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  type: BannerType;
  position: number;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  position: number;
  children: CategoryItem[];
}

export interface FeaturedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  category: { id: number; name: string };
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function getHeroBanners(): Promise<{ banners: BannerItem[]; isError: boolean }> {
  try {
    const res = await apiFetch<ApiResponse<BannerItem[]>>(
      '/api/v1/banners?category=HOME',
      { cache: 'no-store' },
    );
    return { banners: res.data ?? [], isError: false };
  } catch (error) {
    console.error('Failed to fetch hero banners:', error);
    return { banners: [], isError: true };
  }
}

export async function getCategories(): Promise<{ categories: CategoryItem[]; isError: boolean }> {
  try {
    const res = await apiFetch<ApiResponse<CategoryItem[]>>('/api/v1/categories');
    return { categories: res.data ?? [], isError: false };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return { categories: [], isError: true };
  }
}

export async function getFeaturedProducts(
  page = 1,
  limit = 8,
  categoryId?: number,
): Promise<{ products: FeaturedProduct[]; total: number; isError: boolean }> {
  try {
    const endpoint = categoryId
      ? `/api/v1/products?categoryId=${categoryId}&page=${page}&limit=${limit}`
      : `/api/v1/products/featured?page=${page}&limit=${limit}`;
    const res = await apiFetch<ApiResponseWithPagination<FeaturedProduct[]>>(endpoint);
    return { products: res.data ?? [], total: res.pagination?.total ?? 0, isError: false };
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return { products: [], total: 0, isError: true };
  }
}
