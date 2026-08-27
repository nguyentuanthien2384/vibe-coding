import { adminFetch, adminFetchResponse } from './admin-api';
import {
  AdminPaginatedResponse,
  AdminApiResponse,
  GetAdminPostsFilterParams,
} from '../features/blog/types/api.types';
import {
  BlogPostListItem,
  BlogPostDetail,
  BlogPostFormData,
  PostCategory,
  PostStatus,
  AttachedProductDetail,
} from '../features/blog/types/blog.types';

export const blogApi = {
  /**
   * GET /api/v1/admin/blog/posts
   */
  getPosts: (params: Partial<GetAdminPostsFilterParams> = {}): Promise<AdminPaginatedResponse<BlogPostListItem>> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.categoryId) query.set('categoryId', String(params.categoryId));
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.sortBy) query.set('sortBy', params.sortBy);

    const qs = query.toString();
    return adminFetch<AdminPaginatedResponse<BlogPostListItem>>(
      `/admin/blog/posts${qs ? `?${qs}` : ''}`,
    );
  },

  /**
   * GET /api/v1/admin/blog/posts/:id
   */
  getPostById: (id: number): Promise<AdminApiResponse<BlogPostDetail>> => {
    return adminFetch<AdminApiResponse<BlogPostDetail>>(`/admin/blog/posts/${id}`);
  },

  /**
   * POST /api/v1/admin/blog/posts
   */
  createPost: (data: BlogPostFormData): Promise<AdminApiResponse<{ id: number; slug: string; status: string }>> => {
    return adminFetch<AdminApiResponse<{ id: number; slug: string; status: string }>>('/admin/blog/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        slug: data.slug || undefined,
        summary: data.summary,
        thumbnail: data.thumbnail,
        content: data.content,
        status: data.status,
        categoryId: Number(data.categoryId),
        readTimeMinutes: data.readTimeMinutes || 5,
        tagIds: data.tagIds || [],
        productIds: data.productIds || [],
        scheduledAt: data.scheduledAt || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        ogImage: data.ogImage || null,
        canonicalUrl: data.canonicalUrl || null,
      }),
    });
  },

  /**
   * PUT /api/v1/admin/blog/posts/:id
   */
  updatePost: (
    id: number,
    data: Partial<BlogPostFormData>,
  ): Promise<AdminApiResponse<{ id: number; slug: string; status: string }>> => {
    return adminFetch<AdminApiResponse<{ id: number; slug: string; status: string }>>(`/admin/blog/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: data.title,
        slug: data.slug || undefined,
        summary: data.summary,
        thumbnail: data.thumbnail,
        content: data.content,
        status: data.status,
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
        readTimeMinutes: data.readTimeMinutes,
        tagIds: data.tagIds,
        productIds: data.productIds,
        scheduledAt: data.scheduledAt,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        ogImage: data.ogImage,
        canonicalUrl: data.canonicalUrl,
      }),
    });
  },

  /**
   * PATCH /api/v1/admin/blog/posts/:id/status
   */
  changeStatus: (id: number, status: PostStatus): Promise<AdminApiResponse<null>> => {
    return adminFetch<AdminApiResponse<null>>(`/admin/blog/posts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * DELETE /api/v1/admin/blog/posts/:id
   */
  deletePost: (id: number): Promise<AdminApiResponse<null>> => {
    return adminFetch<AdminApiResponse<null>>(`/admin/blog/posts/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * POST /api/v1/admin/blog/posts/upload-thumbnail
   */
  uploadThumbnail: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await adminFetch<{ statusCode: number; data: { url: string; filename: string } }>(
      '/admin/blog/posts/upload-thumbnail',
      {
        method: 'POST',
        body: formData,
      },
    );
    return res.data;
  },

  /**
   * GET /api/v1/admin/blog/categories
   */
  getCategories: (): Promise<AdminApiResponse<PostCategory[]>> => {
    return adminFetch<AdminApiResponse<PostCategory[]>>('/admin/blog/categories');
  },

  /**
   * POST /api/v1/admin/blog/categories
   */
  createCategory: (data: {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    orderIndex?: number;
    isActive?: boolean;
  }): Promise<AdminApiResponse<PostCategory>> => {
    return adminFetch<AdminApiResponse<PostCategory>>('/admin/blog/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /api/v1/admin/blog/categories/:id
   */
  updateCategory: (
    id: number,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
      orderIndex?: number;
      isActive?: boolean;
    },
  ): Promise<AdminApiResponse<PostCategory>> => {
    return adminFetch<AdminApiResponse<PostCategory>>(`/admin/blog/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /api/v1/admin/blog/categories/:id
   */
  deleteCategory: (id: number): Promise<AdminApiResponse<null>> => {
    return adminFetch<AdminApiResponse<null>>(`/admin/blog/categories/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /api/v1/admin/blog/products/search-embed
   */
  searchEmbedProducts: (query: string): Promise<AdminApiResponse<AttachedProductDetail[]>> => {
    const qs = new URLSearchParams({ q: query }).toString();
    return adminFetch<AdminApiResponse<AttachedProductDetail[]>>(
      `/admin/blog/products/search-embed?${qs}`,
    );
  },
};
