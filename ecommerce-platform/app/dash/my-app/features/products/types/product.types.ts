export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export interface ProductGalleryItem {
  url: string;
  position: number;
}

export interface JSONEditorContent {
  type: 'doc';
  content: Array<{
    type: string;
    content?: Array<{
      type: string;
      text?: string;
      marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
    }>;
  }>;
}

export interface ProductItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  imageUrl: string;
  images?: ProductGalleryItem[] | null;
  categoryId: number;
  categoryName: string;
  categorySlug?: string;
  isFeatured: boolean;
  status: ProductStatus;
  isActive?: boolean;
  shortDescription: JSONEditorContent | Record<string, unknown> | null;
  longDescription: JSONEditorContent | Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  categoryId: number;
  price: number;
  salePrice?: number | null;
  stock: number;
  imageUrl: string;
  images?: ProductGalleryItem[] | null;
  isFeatured: boolean;
  status: ProductStatus;
  shortDescription: JSONEditorContent | Record<string, unknown> | null;
  longDescription: JSONEditorContent | Record<string, unknown> | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminProductListResponse {
  statusCode: number;
  message: string;
  data: ProductItem[];
  pagination: Pagination;
}

export interface AdminProductDetailResponse {
  statusCode: number;
  message: string;
  data: ProductItem;
}

export interface AdminProductMutateResponse {
  statusCode: number;
  message: string;
  data: ProductItem;
}
