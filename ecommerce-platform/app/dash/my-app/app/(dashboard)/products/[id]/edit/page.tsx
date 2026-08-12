import { Metadata } from 'next';
import ProductFormContainer from '../../../../../features/products/components/product-form-container';
import { productsApi } from '../../../../../lib/products-api';
import { ProductItem } from '../../../../../features/products/types/product.types';

export const metadata: Metadata = {
  title: 'Chỉnh sửa sản phẩm | Admin Dashboard',
  description: 'Trang chỉnh sửa thông tin chi tiết sản phẩm TechBite Admin',
};

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const productId = Number(id);
  let initialProduct: ProductItem | null = null;

  try {
    const res = await productsApi.getOne(productId);
    initialProduct = res.data;
  } catch (error) {
    initialProduct = null;
  }

  return <ProductFormContainer mode="edit" productId={productId} initialData={initialProduct} />;
}
