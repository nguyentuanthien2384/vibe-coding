export interface PostAuthorDto {
  id: number;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  bio?: string | null;
}

export interface PostCategoryDto {
  id: number;
  name: string;
  slug: string;
}

export interface PostTagDto {
  id: number;
  name: string;
  slug: string;
}

export interface PostProductItemDto {
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

export interface PostListItemDto {
  id: number;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  status: string;
  views: number;
  readTimeMinutes: number;
  publishedAt: Date | null;
  author: PostAuthorDto;
  category: PostCategoryDto;
  tags: PostTagDto[];
}

export interface PostDetailDto extends PostListItemDto {
  content: Record<string, unknown>;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  products: PostProductItemDto[];
  relatedPosts: PostListItemDto[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedPostsDto {
  items: PostListItemDto[];
  meta: PaginationMeta;
}

export interface PostCategoryWithCountDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  postCount: number;
}

export interface AdminPostListItemDto {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  status: string;
  views: number;
  category: { id: number; name: string };
  author: { id: number; fullName: string };
  publishedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
}
