'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function ProductPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: ProductPaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-slate-500 font-semibold">
        Hiển thị <span className="text-slate-900 font-extrabold">{startItem}-{endItem}</span> trên tổng số{' '}
        <span className="text-slate-900 font-extrabold">{totalItems}</span> sản phẩm
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-[#4880FF] hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 rounded-xl transition-all border border-slate-200 disabled:border-slate-100 cursor-pointer disabled:cursor-not-allowed"
          title="Trang trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-sm font-bold text-slate-700 px-2">
          {currentPage} / {totalPages || 1}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-[#4880FF] hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 rounded-xl transition-all border border-slate-200 disabled:border-slate-100 cursor-pointer disabled:cursor-not-allowed"
          title="Trang sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
