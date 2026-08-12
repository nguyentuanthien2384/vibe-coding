import { ApiResponse } from '../../auth/interfaces/auth-response.interface';

export interface AdminCategoryItem {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCategoryDetail {
  id: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  parentId: number | null;
  position: number;
  isActive: boolean;
  parent: { id: number; name: string; slug: string } | null;
  children: {
    id: number;
    name: string;
    slug: string;
    position: number;
    isActive: boolean;
  }[];
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCategoryCreated {
  id: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  parentId: number | null;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminCategoriesListResponse extends ApiResponse<AdminCategoryItem[]> {
  pagination: Pagination;
}

export type AdminCategoryDetailResponse = ApiResponse<AdminCategoryDetail>;
export type AdminCategoryMutateResponse = ApiResponse<AdminCategoryCreated>;
export type AdminCategoryDeleteResponse = ApiResponse<null>;
