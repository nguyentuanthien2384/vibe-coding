export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface JSONEditorContent {
  type: 'doc';
  content: Array<{
    type: string;
    content?: Array<{
      type: string;
      text?: string;
      marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
    }>;
  }>;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  isFeatured: boolean;
  status: ProductStatus;
  shortDescription: JSONEditorContent | null;
  longDescription: JSONEditorContent | null;
  createdAt: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  status: ProductStatus;
  shortDescription: JSONEditorContent | null;
  longDescription: JSONEditorContent | null;
}
