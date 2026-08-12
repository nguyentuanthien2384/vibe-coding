export interface ProductGalleryItem {
  url: string;
  position: number;
}

export interface AdminProductItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  images: ProductGalleryItem[] | null;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  isFeatured: boolean;
  isActive: boolean;
  shortDescription: Record<string, any> | null;
  longDescription: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProductDetail {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  images: ProductGalleryItem[] | null;
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  isActive: boolean;
  shortDescription: Record<string, any> | null;
  longDescription: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProductListResponse {
  statusCode: number;
  message: string;
  data: AdminProductItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminProductDetailResponse {
  statusCode: number;
  message: string;
  data: AdminProductDetail;
}

export interface AdminProductMutateResponse {
  statusCode: number;
  message: string;
  data: AdminProductItem;
}

export interface AdminProductDeleteResponse {
  statusCode: number;
  message: string;
}
