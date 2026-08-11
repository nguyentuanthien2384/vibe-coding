export type ProductStatus = 'ACTIVE' | 'OUT_OF_STOCK' | 'DRAFT';

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  price: number;
  salePrice?: number;
  stock: number;
  imageUrl: string;
  colors: string[];
  status: ProductStatus;
  createdAt: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  salePrice?: number;
  stock: number;
  imageUrl: string;
  colors: string[];
  status: ProductStatus;
}
