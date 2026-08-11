'use client';

import { Search } from 'lucide-react';

export interface CategoryFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const CategoryFilterBar = ({ searchValue, onSearchChange }: CategoryFilterBarProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-80 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
        <input
          id="input-search-category"
          type="text"
          placeholder="Tìm kiếm chuyên mục..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
};

export default CategoryFilterBar;
