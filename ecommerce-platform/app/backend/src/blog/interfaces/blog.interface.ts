export interface PostAuthorDto {
  id: number;
  fullName: string;
  avatarUrl: string | null;
  role?: string;
  bio?: string | null;
}

export interface PostCategoryDto {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  orderIndex?: number;
  isActive?: boolean;
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
  total?: number;
  totalItems?: number;
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
  orderIndex?: number;
  isActive?: boolean;
  postCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdminPostListItemDto {
  id: number;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  status: string;
  views: number;
  readTimeMinutes: number;
  categoryId: number;
  category: { id: number; name: string; slug: string };
  authorId: number;
  author: { id: number; fullName: string; avatarUrl: string | null };
  tags: PostTagDto[];
  publishedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPostDetailDto extends AdminPostListItemDto {
  content: Record<string, unknown>;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  products: PostProductItemDto[];
}
