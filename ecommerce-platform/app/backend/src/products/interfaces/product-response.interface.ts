export interface ProductCategoryInfo {
  id: number;
  name: string;
  slug?: string;
}

export interface FeaturedProductItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  category: ProductCategoryInfo;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FeaturedProductsResponse {
  statusCode: number;
  message: string;
  data: FeaturedProductItem[];
  pagination: PaginationMeta;
}

// ── Product List (GET /api/v1/products) ──────────────────────────────────────

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  createdAt: Date;
  category: ProductCategoryInfo;
}

export interface ProductListResponse {
  statusCode: number;
  message: string;
  data: ProductListItem[];
  pagination: PaginationMeta;
}

// ── Filter Meta (GET /api/v1/products/filter-meta) ───────────────────────────

export interface CategoryFilterItem {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterMetaData {
  categories: CategoryFilterItem[];
  priceRange: PriceRange;
}

export interface FilterMetaResponse {
  statusCode: number;
  message: string;
  data: FilterMetaData;
}

// ── Product Detail (GET /api/v1/products/:slug) ──────────────────────────────

export interface ProductDetailItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  category: ProductCategoryInfo;
}

export interface ProductDetailResponse {
  statusCode: number;
  message: string;
  data: ProductDetailItem;
}

export interface RelatedProductsResponse {
  statusCode: number;
  message: string;
  data: ProductListItem[];
}

