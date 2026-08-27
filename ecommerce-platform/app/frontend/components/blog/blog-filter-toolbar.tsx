'use client';

import { PostCategorySummary } from '@/types/blog';
import { CategoryTabPill } from './category-tab-pill';
import { BlogSearchInput } from './blog-search-input';

export interface BlogFilterToolbarProps {
  categories: PostCategorySummary[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'latest' | 'views';
  onSortChange: (sort: 'latest' | 'views') => void;
}

export const BlogFilterToolbar = ({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: BlogFilterToolbarProps) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Category Tabs Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {categories.map((cat) => (
          <CategoryTabPill
            key={cat.id}
            category={cat}
            isActive={activeCategory === cat.slug}
            onSelect={onCategoryChange}
          />
        ))}
      </div>

      {/* Right Tools: Search & Sort */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex-1 md:w-72">
          <BlogSearchInput
            defaultValue={searchQuery}
            onSearch={onSearchChange}
            placeholder="Tìm bài viết, mẹo code..."
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'latest' | 'views')}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 cursor-pointer transition-all shrink-0"
        >
          <option value="latest">Mới nhất</option>
          <option value="views">Xem nhiều nhất</option>
        </select>
      </div>
    </div>
  );
};
