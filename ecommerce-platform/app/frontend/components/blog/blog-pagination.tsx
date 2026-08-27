export interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BlogPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: BlogPaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 pt-8 border-t border-slate-200">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-orange-300 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Trước</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${
              page === currentPage
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-orange-300 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5"
      >
        <span>Sau</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
