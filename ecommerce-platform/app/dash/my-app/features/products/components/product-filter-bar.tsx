'use client';

import { Search, RotateCcw, Folder, Tag, Filter } from 'lucide-react';
import { CategoryOption } from '../types/product.types';

interface CategoryCount {
  name: string;
  count: number;
}

interface ProductFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryName: string) => void;
  categoriesList: CategoryOption[];
  categoryCounts?: Record<string, number>;
  stockFilter: string;
  onStockFilterChange: (stock: string) => void;
  onReset: () => void;
}

export default function ProductFilterBar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  categoriesList,
  categoryCounts = {},
  stockFilter,
  onStockFilterChange,
  onReset,
}: ProductFilterBarProps) {
  const isFiltered =
    searchTerm !== '' ||
    selectedStatus !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    stockFilter !== 'ALL';

  return (
    <div className="space-y-4">
      {/* 1. Main Filter Bar Box */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#4880FF] transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm tên sản phẩm hoặc slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm shadow-inner focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Controls (Category Select, Status, Stock, Reset) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all cursor-pointer appearance-none"
            >
              <option value="ALL">📁 Tất cả chuyên mục</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({categoryCounts[cat.name] || 0})
                </option>
              ))}
            </select>
            <Folder className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán (Active)</option>
            <option value="INACTIVE">Tạm ẩn (Inactive)</option>
          </select>

          {/* Stock Dropdown */}
          <select
            value={stockFilter}
            onChange={(e) => onStockFilterChange(e.target.value)}
            className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all cursor-pointer"
          >
            <option value="ALL">Tất cả kho hàng</option>
            <option value="IN_STOCK">Còn hàng (&gt; 0)</option>
            <option value="OUT_OF_STOCK">Hết hàng (= 0)</option>
          </select>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="p-2.5 text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-2xl border border-gray-200 hover:border-red-100 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Quick Category Chips / Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0 pr-1">
          <Tag className="w-3.5 h-3.5 text-[#4880FF]" />
          Lọc nhanh chuyên mục:
        </span>

        {/* All Categories Chip */}
        <button
          type="button"
          onClick={() => onCategoryChange('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
            selectedCategory === 'ALL'
              ? 'bg-[#4880FF] text-white border-[#4880FF] shadow-md shadow-blue-200'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <span>Tất cả</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedCategory === 'ALL'
                ? 'bg-white/20 text-white font-extrabold'
                : 'bg-gray-100 text-gray-500 font-bold'
            }`}
          >
            {categoryCounts['ALL'] || 0}
          </span>
        </button>

        {/* Category List Chips */}
        {categoriesList.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const count = categoryCounts[cat.name] || 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-[#4880FF] text-white border-[#4880FF] shadow-md shadow-blue-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-[#4880FF]'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isSelected
                    ? 'bg-white/20 text-white font-extrabold'
                    : 'bg-gray-100 text-gray-500 font-bold'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
