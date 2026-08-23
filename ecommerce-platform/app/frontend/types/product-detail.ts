// types/product-detail.ts

export type TipTapDoc = {
  type: 'doc';
  content?: unknown[];
} | Record<string, unknown>;

export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: TipTapDoc | null;
  longDescription: TipTapDoc | null;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  stock: number;
  imageUrl: string;
  images?: string[];
  isNew?: boolean;
  category: {
    id: number;
    name: string;
    slug?: string;
  };
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
}

export interface ProductHighlightItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface ProductSpecificationItem {
  label: string;
  value: string;
}
