// components/product-list/product-list-empty.tsx

interface ProductListEmptyProps {
  onResetFilter?: () => void;
}

const ProductListEmpty = ({ onResetFilter }: ProductListEmptyProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-4 my-6">
      <div className="w-16 h-16 text-slate-300 bg-slate-50 p-3 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800">Không tìm thấy sản phẩm</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Không có sản phẩm nào khớp với bộ lọc của bạn. Hãy thử điều chỉnh hoặc xóa bộ lọc.
        </p>
      </div>
      {onResetFilter && (
        <button
          onClick={onResetFilter}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );
};

export default ProductListEmpty;
