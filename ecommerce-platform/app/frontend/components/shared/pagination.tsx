'use client';

// components/shared/pagination.tsx
import { PaginationMeta } from '@/types/product-list';
import { useProductListNavigation } from '@/hooks/use-product-list-navigation';

export interface PaginationContainerProps {
  meta: PaginationMeta;
  onPageChange?: (newPage: number) => void;
}

const Pagination = ({ meta, onPageChange }: PaginationContainerProps) => {
  const { currentPage, totalPages } = meta;
  const { updateFilters } = useProductListNavigation();

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      updateFilters({ page: page > 1 ? page : null });
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 pt-6 pb-2">
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 h-10 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Trước
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all border ${
            page === currentPage
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 h-10 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Tiếp →
      </button>
    </div>
  );
};

export default Pagination;
