'use client';

// components/product-list/product-list-toolbar.tsx
import { ProductSortOption } from '@/types/product-list';
import { useProductListNavigation } from '@/hooks/use-product-list-navigation';

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'featured', label: 'Sắp xếp: Phổ biến nhất' },
  { value: 'latest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
  { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
];

export interface ProductListToolbarContainerProps {
  totalProducts: number;
  sortOption: ProductSortOption;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  onSortChange?: (newSort: ProductSortOption) => void;
}

const ProductListToolbar = ({
  totalProducts,
  sortOption,
  isFilterOpen,
  onToggleFilter,
  onSortChange,
}: ProductListToolbarContainerProps) => {
  const { updateFilters } = useProductListNavigation();

  const handleSortSelect = (newSort: ProductSortOption) => {
    if (onSortChange) {
      onSortChange(newSort);
    } else {
      updateFilters({ sort: newSort === 'featured' ? null : newSort });
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
      {/* Counter */}
      <p className="text-sm font-medium text-slate-600">
        Hiển thị <span className="font-bold text-slate-900">{totalProducts}</span> sản phẩm
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter Toggle */}
        <button
          onClick={onToggleFilter}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border cursor-pointer ${
            isFilterOpen
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200/60'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 6a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
          </svg>
          {isFilterOpen ? 'Ẩn bộ lọc' : 'Bộ lọc'}
        </button>

        {/* Sort */}
        <select
          value={sortOption}
          onChange={(e) => handleSortSelect(e.target.value as ProductSortOption)}
          className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProductListToolbar;
