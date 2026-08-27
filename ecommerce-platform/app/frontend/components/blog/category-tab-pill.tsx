import { PostCategorySummary } from '@/types/blog';

export interface CategoryTabPillProps {
  category: PostCategorySummary;
  isActive: boolean;
  onSelect: (slug: string) => void;
}

export const CategoryTabPill = ({ category, isActive, onSelect }: CategoryTabPillProps) => {
  return (
    <button
      onClick={() => onSelect(category.slug)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none cursor-pointer whitespace-nowrap ${
        isActive
          ? 'bg-orange-600 text-white border border-orange-600 shadow-md shadow-orange-600/20 font-semibold'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/50'
      }`}
    >
      {category.icon && <span>{category.icon}</span>}
      {category.name}
      {category.postCount !== undefined && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {category.postCount}
        </span>
      )}
    </button>
  );
};
