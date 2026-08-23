import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { SearchResultsPageClient } from '@/features/search/components/search-results-page-client';

export const metadata: Metadata = {
  title: 'Tìm kiếm hệ thống | DashStack Admin',
  description: 'Tìm kiếm nhanh đơn hàng, sản phẩm, khách hàng, chuyên mục và nhân viên trên toàn hệ thống',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 animate-pulse">
          Đang tải dữ liệu tìm kiếm...
        </div>
      }
    >
      <SearchResultsPageClient />
    </Suspense>
  );
}
