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
    <div className="px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-gray-500 font-semibold tracking-wide">
        Showing <span className="text-[#202224] font-extrabold">{startItem}-{endItem}</span> of{' '}
        <span className="text-[#202224] font-extrabold">{totalItems}</span> products
      </p>

      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#4880FF] hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 rounded-xl transition-all shadow-sm border border-gray-200 hover:border-blue-200 cursor-pointer disabled:cursor-not-allowed"
          title="Trang trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Current / Total info */}
        <span className="px-3 py-1 text-sm font-bold text-[#202224]">
          {currentPage} / {totalPages || 1}
        </span>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#4880FF] hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 rounded-xl transition-all shadow-sm border border-gray-200 hover:border-blue-200 cursor-pointer disabled:cursor-not-allowed"
          title="Trang sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
