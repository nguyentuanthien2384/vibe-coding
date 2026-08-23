import { Suspense } from 'react';
import ProductPageClient from '../../../features/products/components/product-page-client';
import { productsApi } from '../../../lib/products-api';
import { AdminProductListResponse } from '../../../features/products/types/product.types';

export const metadata = {
  title: 'Quản lý sản phẩm | Admin Dashboard',
  description: 'Trang quản lý danh sách sản phẩm, tồn kho và danh mục TechBite Admin',
};

export default async function ProductsPage() {
  let initialData: AdminProductListResponse | null = null;

  try {
    initialData = await productsApi.getList({ page: 1, limit: 10 });
  } catch (error) {
    // If server pre-fetch fails (e.g. invalid auth on server context), client will fetch on mount
    initialData = null;
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải danh sách sản phẩm...</div>}>
      <ProductPageClient initialData={initialData} />
    </Suspense>
  );
}

