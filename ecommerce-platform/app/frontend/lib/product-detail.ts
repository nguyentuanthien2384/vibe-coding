// lib/product-detail.ts

import { apiFetch, ApiResponse } from './api';
import { ProductDetailData } from '@/types/product-detail';
import { ProductItemData } from '@/types/product-list';
import { getProductsList } from './product-list';

export interface RawProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: Record<string, unknown> | null;
  longDescription: Record<string, unknown> | null;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  category: {
    id: number;
    name: string;
    slug?: string;
  };
}

export interface FetchProductDetailResult {
  product: ProductDetailData | null;
  isError: boolean;
  notFound?: boolean;
}

/**
 * Lấy chi tiết sản phẩm từ NestJS Backend API (GET /api/v1/products/:slug)
 */
export async function getProductBySlug(slug: string): Promise<FetchProductDetailResult> {
  try {
    const res = await apiFetch<ApiResponse<RawProductDetail>>(`/api/v1/products/${encodeURIComponent(slug)}`);
    const data = res.data;

    if (!data) {
      return { product: null, isError: false, notFound: true };
    }

    const price = data.salePrice !== null ? data.salePrice : data.price;
    const originalPrice = data.salePrice !== null ? data.price : undefined;
    const discountPercentage =
      data.salePrice !== null && data.price > 0
        ? Math.round(((data.price - data.salePrice) / data.price) * 100)
        : undefined;

    // Tự sinh danh sách ảnh thumbnail gallery nếu chỉ có 1 ảnh gốc
    const images = [
      data.imageUrl,
      data.imageUrl,
      data.imageUrl,
      data.imageUrl,
    ];

    const product: ProductDetailData = {
      id: String(data.id),
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription || null,
      longDescription: data.longDescription || null,
      price,
      originalPrice,
      discountPercentage,
      stock: data.stock,
      imageUrl: data.imageUrl,
      images,
      isNew: data.isFeatured,
      category: {
        id: data.category.id,
        name: data.category.name,
        slug: data.category.slug,
      },
      rating: 4.9,
      reviewCount: 156,
      soldCount: 2400,
    };

    return { product, isError: false };
  } catch (error) {
    console.error(`Failed to fetch product detail for slug ${slug}:`, error);
    return { product: null, isError: true };
  }
}

/**
 * Lấy danh sách sản phẩm liên quan cùng category
 */
export async function getRelatedProducts(
  categoryId: number,
  currentProductId: string,
): Promise<ProductItemData[]> {
  try {
    const res = await getProductsList({ page: 1, limit: 8 });
    // Lọc bỏ sản phẩm hiện tại và ưu tiên cùng category
    const filtered = res.products.filter((p) => p.id !== currentProductId);
    return filtered.slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
}
