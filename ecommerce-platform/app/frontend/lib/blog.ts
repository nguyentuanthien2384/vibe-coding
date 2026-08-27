// lib/blog.ts
// Server-side & Client-side data fetching functions cho Blog Module

import { apiFetch, ApiResponse } from './api';
import {
  BlogPostListItem,
  BlogPostDetail,
  PostCategorySummary,
  TOCItem,
} from '@/types/blog';
import { TipTapDoc } from '@/types/tiptap';
import { slugify } from '@/components/blog/blog-content-renderer';

export interface BlogPostsResponse {
  items: BlogPostListItem[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface GetBlogPostsParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  q?: string;
  sort?: 'latest' | 'views';
  featured?: boolean;
}

/**
 * Lấy danh sách chuyên mục blog
 */
export async function getBlogCategories(): Promise<{
  categories: PostCategorySummary[];
  isError: boolean;
}> {
  try {
    const res = await apiFetch<ApiResponse<PostCategorySummary[]>>(
      '/api/v1/blog/categories',
      { next: { revalidate: 300 } }
    );
    return { categories: res.data ?? [], isError: false };
  } catch (error) {
    console.error('Failed to fetch blog categories:', error);
    return { categories: [], isError: true };
  }
}

/**
 * Lấy danh sách bài viết công khai có phân trang, lọc, tìm kiếm
 */
export async function getBlogPosts(
  params?: GetBlogPostsParams
): Promise<{
  data: BlogPostsResponse | null;
  isError: boolean;
}> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.category && params.category !== 'tat-ca') {
      searchParams.set('category', params.category);
    }
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.q) searchParams.set('q', params.q);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.featured !== undefined) {
      searchParams.set('featured', String(params.featured));
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/blog/posts${queryString ? `?${queryString}` : ''}`;

    const res = await apiFetch<ApiResponse<BlogPostsResponse>>(endpoint, {
      next: { revalidate: 60 },
    });
    return { data: res.data ?? null, isError: false };
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return { data: null, isError: true };
  }
}

/**
 * Lấy chi tiết bài viết theo Slug
 */
export async function getBlogPostDetail(
  slug: string
): Promise<{
  post: BlogPostDetail | null;
  isError: boolean;
}> {
  try {
    const res = await apiFetch<ApiResponse<BlogPostDetail>>(
      `/api/v1/blog/posts/${slug}`,
      { next: { revalidate: 120 } }
    );
    return { post: res.data ?? null, isError: false };
  } catch (error) {
    console.error(`Failed to fetch blog post (${slug}):`, error);
    return { post: null, isError: true };
  }
}

/**
 * Ghi nhận lượt xem bài viết bất đồng bộ
 */
export async function recordBlogPostView(slug: string): Promise<void> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    await fetch(`${apiBase}/api/v1/blog/posts/${slug}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.warn(`Record view for ${slug} failed:`, err);
  }
}

/**
 * Trích xuất mục lục (Table of Contents) tự động từ TipTap doc
 */
export function extractTocFromTipTap(doc?: TipTapDoc | null): TOCItem[] {
  if (!doc || !doc.content || !Array.isArray(doc.content)) return [];

  const items: TOCItem[] = [];

  for (const node of doc.content) {
    if (node.type === 'heading') {
      const level = (node.attrs?.level === 3 ? 3 : 2) as 2 | 3;
      const textContent =
        node.content?.map((c) => c.text || '').join('').trim() || '';

      if (textContent) {
        items.push({
          id: slugify(textContent),
          text: textContent,
          level,
        });
      }
    }
  }

  return items;
}
