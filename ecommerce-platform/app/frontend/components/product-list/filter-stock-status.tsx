'use client';

// components/product-list/filter-stock-status.tsx
import { FilterStockStatusProps } from '@/types/product-list';

const FilterStockStatus = ({ inStockOnly, onToggle }: FilterStockStatusProps) => {
  return (
    <div>
      <label className="flex items-center justify-between cursor-pointer group">
        <span className="font-extrabold text-slate-900 tracking-tight uppercase text-xs">
          Chỉ sản phẩm còn hàng
        </span>
        <div className="relative">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div
            onClick={() => onToggle(!inStockOnly)}
            className={`w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
              inStockOnly ? 'bg-orange-600' : 'bg-gray-200'
            } relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all ${
              inStockOnly ? 'after:translate-x-5' : ''
            }`}
          />
        </div>
      </label>
    </div>
  );
};

export default FilterStockStatus;
