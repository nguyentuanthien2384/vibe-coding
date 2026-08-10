"use client";

import { ProductCard, Product } from "./product-card";
import { SectionHeader } from "./section-header";

interface FeaturedProductsProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
  products: Product[];
  isLoading?: boolean;
  isError?: boolean;
}

export const FeaturedProductsSection = ({
  title,
  subtitle,
  actionLabel,
  actionHref,
  products,
  isLoading = false,
  isError = false,
}: FeaturedProductsProps) => {
  return (
    <section className="pt-4 pb-16">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        actionHref={actionHref}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden animate-pulse border border-slate-100"
            >
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-9 bg-gray-200 rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 text-center my-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-red-800">
            Không thể tải danh sách sản phẩm
          </h3>
          <p className="text-xs sm:text-sm text-red-600 mt-1 max-w-md mx-auto">
            Đã xảy ra lỗi khi kết nối tới máy chủ backend. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 sm:p-12 text-center my-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-700">
            Chưa có sản phẩm nào
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Không tìm thấy sản phẩm nổi bật trong mục này. Vui lòng chọn danh mục khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
