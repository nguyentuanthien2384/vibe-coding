'use client';

import { Search, RotateCcw } from 'lucide-react';
import { PostCategory, PostStatus } from '../types/blog.types';

interface BlogFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategoryId: number | null;
  onCategoryChange: (id: number | null) => void;
  selectedStatus: PostStatus | 'ALL';
  onStatusChange: (status: PostStatus | 'ALL') => void;
  sortBy: 'latest' | 'views';
  onSortChange: (sort: 'latest' | 'views') => void;
  categories: PostCategory[];
  onReset: () => void;
}

const STATUS_OPTIONS: { value: PostStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PUBLISHED', label: '✅ Đã xuất bản' },
  { value: 'SCHEDULED', label: '🕐 Đã lên lịch' },
  { value: 'DRAFT', label: '📝 Bản nháp' },
  { value: 'ARCHIVED', label: '📦 Lưu trữ' },
];

const selectClass =
  'w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all cursor-pointer';

export default function BlogFilterBar({
  searchTerm,
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  categories,
  onReset,
}: BlogFilterBarProps) {
  const isFiltered =
    searchTerm !== '' || selectedCategoryId !== null || selectedStatus !== 'ALL' || sortBy !== 'latest';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Search Input - col-span-5 */}
        <div className="lg:col-span-5 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#4880FF] transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm bài viết theo tiêu đề, slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
          />
        </div>

        {/* Category Filter - col-span-3 */}
        <div className="sm:col-span-1 lg:col-span-3">
          <select
            value={selectedCategoryId ?? ''}
            onChange={(e) => onCategoryChange(e.target.value === '' ? null : Number(e.target.value))}
            className={selectClass}
          >
            <option value="">Tất cả chuyên mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter - col-span-2 */}
        <div className="sm:col-span-1 lg:col-span-2">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as PostStatus | 'ALL')}
            className={selectClass}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown - col-span-2 */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'latest' | 'views')}
            className={selectClass}
          >
            <option value="latest">🕐 Mới nhất</option>
            <option value="views">👁️ Lượt xem</option>
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              title="Xóa tất cả bộ lọc"
              className="flex-shrink-0 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-gray-200 hover:border-red-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
