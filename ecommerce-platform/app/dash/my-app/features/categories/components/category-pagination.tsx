'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CategoryPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const CategoryPagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: CategoryPaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
      <p className="text-sm text-gray-400 font-semibold">
        Hiển thị{' '}
        <span className="text-gray-600 font-bold">
          {startItem}–{endItem}
        </span>{' '}
        trong tổng số{' '}
        <span className="text-gray-600 font-bold">{totalItems}</span> chuyên mục
      </p>

      <div className="flex items-center gap-1.5">
        <button
          id="btn-prev-page"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            id={`btn-page-${page}`}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
              page === currentPage
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                : 'text-gray-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          id="btn-next-page"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CategoryPagination;
