import { TipTapDoc } from './tiptap.types';

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export interface PostAuthor {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'STAFF';
}

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  orderIndex: number;
  isActive: boolean;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostTag {
  id: number;
  name: string;
  slug: string;
}

export interface AttachedProductDetail {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  salePrice: number | null;
  stock: number;
  isActive: boolean;
}

export interface AttachedProduct {
  id: number;
  postId?: number;
  productId: number;
  displayOrder: number;
  product: AttachedProductDetail;
}

export interface BlogPostListItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  status: PostStatus;
  views: number;
  readTimeMinutes: number;
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  authorId: number;
  author: {
    id: number;
    fullName: string;
    avatarUrl: string | null;
  };
  tags: PostTag[];
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostDetail extends BlogPostListItem {
  content: TipTapDoc;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  products: AttachedProduct[];
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  content: TipTapDoc;
  status: PostStatus;
  categoryId: number;
  readTimeMinutes?: number;
  tagIds: number[];
  productIds: number[];
  scheduledAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
}
