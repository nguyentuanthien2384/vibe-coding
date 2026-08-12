import { Metadata } from 'next';
import ProductFormContainer from '../../../../../features/products/components/product-form-container';
import { MOCK_PRODUCTS } from '../../../../../features/products/data/mock-products';

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
  const initialProduct = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];

  return <ProductFormContainer mode="edit" initialData={initialProduct} />;
}
