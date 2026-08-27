import { TipTapDoc } from './tiptap';

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export interface AuthorSummary {
  id: number;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  bio?: string | null;
}

export interface PostCategorySummary {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  postCount?: number;
}

export interface TagSummary {
  id: number;
  name: string;
  slug: string;
}

export interface PostProductItem {
  id: number;
  postId: number;
  productId: number;
  displayOrder: number;
  product: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
    salePrice: number | null;
    stock: number;
    isActive: boolean;
  };
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
  publishedAt: string;
  author: AuthorSummary;
  category: PostCategorySummary;
  tags: TagSummary[];
}

export interface BlogPostDetail extends BlogPostListItem {
  content: TipTapDoc;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  products: PostProductItem[];
  relatedPosts: BlogPostListItem[];
}

export interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
}
