import { Metadata } from 'next';
import CategoryPageClient from '../../../features/categories/components/category-page-client';

export const metadata: Metadata = {
  title: 'Quản lý Chuyên mục | TechBite Admin',
  description: 'Thêm, sửa, xóa và phân loại chuyên mục sản phẩm trong hệ thống TechBite.',
};

const CategoriesPage = () => {
  return <CategoryPageClient />;
};

export default CategoriesPage;
