import { Metadata } from 'next';
import ProductFormContainer from '../../../../features/products/components/product-form-container';

export const metadata: Metadata = {
  title: 'Thêm sản phẩm mới | Admin Dashboard',
  description: 'Trang tạo sản phẩm mới cho hệ thống TechBite Admin',
};

export default function CreateProductPage() {
  return <ProductFormContainer mode="create" />;
}
