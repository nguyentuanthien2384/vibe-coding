import { BlogPostListItem, BlogPostDetail, PostCategory, PostStatus } from './blog.types';

export interface AdminApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface AdminPaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalItems?: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminPaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: {
    items: T[];
    meta: AdminPaginatedMeta;
  };
}

export interface GetAdminPostsFilterParams {
  search?: string;
  categoryId?: number;
  status?: PostStatus | 'ALL';
  sortBy?: 'latest' | 'views';
  page: number;
  limit: number;
}

export type { BlogPostListItem, BlogPostDetail, PostCategory };
