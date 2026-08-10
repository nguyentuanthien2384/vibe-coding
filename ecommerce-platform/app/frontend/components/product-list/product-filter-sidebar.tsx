'use client';

// components/product-list/product-filter-sidebar.tsx
import { usePathname } from 'next/navigation';
import { CategoryFilterItem } from '@/types/product-list';
import FilterCategoryGroup from './filter-category-group';
import FilterPriceRange from './filter-price-range';
import FilterStockStatus from './filter-stock-status';
import { useProductListNavigation } from '@/hooks/use-product-list-navigation';

export interface ProductFilterSidebarContainerProps {
  categories: CategoryFilterItem[];
  selectedCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: { min: number; max: number };
  inStockOnly?: boolean;
}

const ProductFilterSidebar = ({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  priceRange,
  inStockOnly = false,
}: ProductFilterSidebarContainerProps) => {
  const { updateFilters, resetAllFilters } = useProductListNavigation();
  const pathname = usePathname();

  const categoryFromPath = pathname?.startsWith('/categories/')
    ? pathname.replace('/categories/', '').split('?')[0]
    : undefined;

  const currentCategory = selectedCategory || categoryFromPath;

  const handleSelectCategory = (slug?: string) => {
    updateFilters({ category: slug ?? null });
  };

  const handlePriceChange = (min?: number, max?: number) => {
    updateFilters({
      minPrice: min !== undefined ? min : null,
      maxPrice: max !== undefined ? max : null,
    });
  };

  const handleStockToggle = (inStock: boolean) => {
    updateFilters({ inStock: inStock ? 'true' : null });
  };

  return (
    <aside className="w-full lg:w-64 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-6 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 6a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
          </svg>
          Bộ lọc
        </h2>
        <button
          onClick={resetAllFilters}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer hover:underline transition-colors"
        >
          Xóa lọc
        </button>
      </div>

      {/* Categories */}
      <FilterCategoryGroup
        categories={categories}
        selectedCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
      />

      <div className="h-px bg-slate-100 w-full" />

      {/* Price Range */}
      <FilterPriceRange
        minPrice={minPrice}
        maxPrice={maxPrice}
        priceRange={priceRange}
        onChange={handlePriceChange}
      />

      <div className="h-px bg-slate-100 w-full" />

      {/* Stock Status */}
      <FilterStockStatus inStockOnly={inStockOnly} onToggle={handleStockToggle} />
    </aside>
  );
};

export default ProductFilterSidebar;
