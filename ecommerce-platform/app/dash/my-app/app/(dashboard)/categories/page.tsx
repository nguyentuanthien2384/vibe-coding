import { Metadata } from 'next';
import { serverCategoriesApi } from '../../../lib/server/categories-api';
import CategoryPageClient from '../../../features/categories/components/category-page-client';
import { AdminCategoriesListResponse } from '../../../features/categories/types/category.types';

export const metadata: Metadata = {
  title: 'Quản lý Chuyên mục | TechBite Admin',
  description: 'Thêm, sửa, xóa và phân loại chuyên mục sản phẩm trong hệ thống TechBite.',
};

const CategoriesPage = async () => {
  // Fetch dữ liệu trang đầu tiên phía Server — không block JS, không flash loading
  let initialData: AdminCategoriesListResponse | null = null;

  try {
    initialData = await serverCategoriesApi.getList({ page: 1, limit: 10 });
  } catch {
    // Nếu fetch thất bại (VD: chưa đăng nhập), Client Component sẽ tự fetch lại
    initialData = null;
  }

  return <CategoryPageClient initialData={initialData} />;
};

export default CategoriesPage;
