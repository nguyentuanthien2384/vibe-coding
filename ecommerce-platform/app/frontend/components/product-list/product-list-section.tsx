'use client';

// components/product-list/product-list-section.tsx
import { useState } from 'react';
import {
  CategoryFilterItem,
  PaginationMeta,
  ProductItemData,
  ProductSortOption,
} from '@/types/product-list';
import ProductFilterSidebar from './product-filter-sidebar';
import ProductListToolbar from './product-list-toolbar';
import ProductGrid from './product-grid';
import Pagination from '@/components/shared/pagination';

export interface ProductListSectionProps {
  products: ProductItemData[];
  meta: PaginationMeta;
  categories: CategoryFilterItem[];
  selectedCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: { min: number; max: number };
  inStockOnly: boolean;
  sortOption: ProductSortOption;
}

const ProductListSection = ({
  products,
  meta,
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  priceRange,
  inStockOnly,
  sortOption,
}: ProductListSectionProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8 relative">
      {/* Sidebar Filter */}
      {isFilterOpen && (
        <ProductFilterSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceRange={priceRange}
          inStockOnly={inStockOnly}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full min-w-0 space-y-6">
        <ProductListToolbar
          totalProducts={meta.totalItems}
          sortOption={sortOption}
          isFilterOpen={isFilterOpen}
          onToggleFilter={() => setIsFilterOpen((prev) => !prev)}
        />

        <ProductGrid
          products={products}
          isFilterOpen={isFilterOpen}
        />

        {meta.totalPages > 1 && <Pagination meta={meta} />}
      </div>
    </div>
  );
};

export default ProductListSection;
