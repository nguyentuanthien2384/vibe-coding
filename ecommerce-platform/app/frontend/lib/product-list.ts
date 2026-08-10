// lib/product-list.ts
import { apiFetch, ApiResponse, ApiResponseWithPagination } from './api';
import {
  CategoryFilterItem,
  PaginationMeta,
  ProductItemData,
  ProductSortOption,
  PromotionBannerItem,
} from '@/types/product-list';

export interface RawBackendProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  createdAt: string;
  category: {
    id: number;
    name: string;
    slug?: string;
  };
}

export interface RawFilterMetaData {
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    productCount: number;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface RawBannerItem {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  type: string;
  position: number;
}

export interface FetchProductsQueryParams {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchProductsResult {
  products: ProductItemData[];
  meta: PaginationMeta;
  isError: boolean;
}

export interface FetchFilterMetaResult {
  categories: CategoryFilterItem[];
  priceRange: { min: number; max: number };
  isError: boolean;
}

export interface FetchPromotionBannerResult {
  bannerUrl: string;
  title: string;
  subtitle?: string;
  isError: boolean;
}

/**
 * Lấy danh sách sản phẩm từ NestJS Backend API
 */
export async function getProductsList(
  queryParams: FetchProductsQueryParams,
  categoryMap?: Map<string, number>,
): Promise<FetchProductsResult> {
  try {
    const {
      categorySlug,
      minPrice,
      maxPrice,
      inStock,
      sort = 'featured',
      page = 1,
      limit = 12,
      search,
    } = queryParams;

    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));

    // Map categorySlug -> categoryId
    if (categorySlug && categorySlug !== 'all' && categoryMap?.has(categorySlug)) {
      params.set('categoryId', String(categoryMap.get(categorySlug)));
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
      params.set('minPrice', String(minPrice));
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      params.set('maxPrice', String(maxPrice));
    }
    if (search && search.trim()) {
      params.set('search', search.trim());
    }

    // Map sorting options to Backend DTO (sortBy, sortOrder)
    switch (sort) {
      case 'latest':
        params.set('sortBy', 'createdAt');
        params.set('sortOrder', 'desc');
        break;
      case 'price_asc':
        params.set('sortBy', 'price');
        params.set('sortOrder', 'asc');
        break;
      case 'price_desc':
        params.set('sortBy', 'price');
        params.set('sortOrder', 'desc');
        break;
      case 'featured':
      default:
        params.set('sortBy', 'isFeatured');
        params.set('sortOrder', 'desc');
        break;
    }

    const endpoint = `/api/v1/products?${params.toString()}`;
    const res = await apiFetch<ApiResponseWithPagination<RawBackendProduct[]>>(endpoint);

    let rawData = res.data ?? [];

    // Client-side inStock filter if requested (if backend doesn't support inStock param directly)
    if (inStock) {
      rawData = rawData.filter((item) => item.stock > 0);
    }

    let products: ProductItemData[] = rawData.map((item) => {
      const price = item.salePrice !== null ? item.salePrice : item.price;
      const originalPrice = item.salePrice !== null ? item.price : undefined;
      const discountPercentage =
        item.salePrice !== null && item.price > 0
          ? Math.round(((item.price - item.salePrice) / item.price) * 100)
          : undefined;

      return {
        id: String(item.id),
        name: item.name,
        slug: item.slug,
        imageUrl: item.imageUrl,
        price,
        originalPrice,
        discountPercentage,
        stock: item.stock,
        isNew: item.isFeatured,
        categoryName: item.category?.name,
      };
    });

    // Enforce effective price filtering (salePrice ?? price)
    if (minPrice !== undefined && !isNaN(minPrice)) {
      products = products.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      products = products.filter((p) => p.price <= maxPrice);
    }

    const meta: PaginationMeta = {
      currentPage: res.pagination?.page ?? page,
      totalPages: res.pagination?.totalPages ?? 1,
      pageSize: res.pagination?.limit ?? limit,
      totalItems: res.pagination?.total ?? products.length,
    };

    return { products, meta, isError: false };
  } catch (error) {
    console.error('Failed to fetch product list:', error);
    return {
      products: [],
      meta: { currentPage: 1, totalPages: 1, pageSize: 12, totalItems: 0 },
      isError: true,
    };
  }
}

/**
 * Lấy danh mục & khoảng giá cho Sidebar Filter từ Backend
 */
export async function getFilterMeta(): Promise<FetchFilterMetaResult> {
  try {
    const res = await apiFetch<ApiResponse<RawFilterMetaData>>('/api/v1/products/filter-meta');
    const data = res.data;

    const totalProductCount = data?.categories.reduce((acc, cat) => acc + cat.productCount, 0) ?? 0;

    const categories: CategoryFilterItem[] = [
      {
        id: 'all',
        name: 'Tất cả sản phẩm',
        slug: 'all',
        count: totalProductCount,
      },
      ...(data?.categories.map((c) => ({
        id: String(c.id),
        name: c.name,
        slug: c.slug,
        count: c.productCount,
      })) ?? []),
    ];

    return {
      categories,
      priceRange: data?.priceRange ?? { min: 0, max: 200000 },
      isError: false,
    };
  } catch (error) {
    console.error('Failed to fetch filter meta:', error);
    return {
      categories: [{ id: 'all', name: 'Tất cả sản phẩm', slug: 'all', count: 0 }],
      priceRange: { min: 0, max: 200000 },
      isError: true,
    };
  }
}

export interface FetchPromotionBannersResult {
  banners: PromotionBannerItem[];
  isError: boolean;
}

/**
 * Lấy danh sách Banner khuyến mãi cho trang Product List từ Backend
 */
export async function getPromotionBanners(): Promise<FetchPromotionBannersResult> {
  const DEFAULT_BANNERS: PromotionBannerItem[] = [
    {
      id: 0,
      title: 'Bữa Trưa Đêm Đỉnh Cao - Năng Lượng Chạy Deadline',
      subtitle: 'Giảm ngay 25% cho tất cả món ăn vặt & nước uống sảng khoái sau 22h!',
      imageUrl:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
      linkUrl: null,
    },
  ];

  try {
    const res = await apiFetch<ApiResponse<RawBannerItem[]>>('/api/v1/banners?type=PROMOTION_BANNER');
    const rawBanners = res.data ?? [];

    if (rawBanners.length > 0) {
      const banners: PromotionBannerItem[] = rawBanners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.imageUrl,
        linkUrl: b.linkUrl,
      }));
      return { banners, isError: false };
    }

    return { banners: DEFAULT_BANNERS, isError: false };
  } catch (error) {
    console.error('Failed to fetch promotion banners:', error);
    return { banners: DEFAULT_BANNERS, isError: true };
  }
}
