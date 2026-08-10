'use client';

// components/product-list/filter-category-group.tsx
import { FilterCategoryGroupProps } from '@/types/product-list';

const CATEGORY_ICONS: Record<string, string> = {
  all: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
  burger: 'M4 6h16M4 12h16M4 18h16',
  'fried-chicken': 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  drinks: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  snacks: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
};

const FilterCategoryGroup = ({ categories, selectedCategory, onSelectCategory }: FilterCategoryGroupProps) => {
  return (
    <div>
      <h3 className="font-extrabold text-slate-900 tracking-tight mb-4 uppercase text-xs">Danh mục</h3>
      <ul className="space-y-1">
        {categories.map((cat) => {
          const isActive = (!selectedCategory && cat.slug === 'all') || selectedCategory === cat.slug;
          return (
            <li key={cat.id}>
              <button
                onClick={() => onSelectCategory(cat.slug === 'all' ? undefined : cat.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-orange-50 border border-orange-100 text-orange-600 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-orange-600 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-orange-600'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={CATEGORY_ICONS[cat.slug] ?? CATEGORY_ICONS['all']}
                    />
                  </svg>
                  <span
                    className={`truncate transition-colors ${
                      isActive
                        ? 'text-orange-600 font-extrabold'
                        : 'text-slate-700 font-medium group-hover:text-orange-600'
                    }`}
                  >
                    {cat.name}
                  </span>
                  <span
                    className={`text-xs py-0.5 px-2 rounded-full font-bold flex-shrink-0 ml-1 transition-colors ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FilterCategoryGroup;
