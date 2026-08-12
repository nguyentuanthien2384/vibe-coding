// Align với API response từ GET /api/v1/admin/categories
export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface Category {
  id: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  parentId: number | null;
  parentName: string | null;
  position: number;
  isActive: boolean;
  productCount: number;
  childrenCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  iconUrl: string;
  parentId: number | null;
  isActive: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminCategoriesListResponse {
  statusCode: number;
  message: string;
  data: Category[];
  pagination: Pagination;
}

export interface AdminCategoryMutateResponse {
  statusCode: number;
  message: string;
  data: Category;
}
