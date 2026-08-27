import { Tag, Folder } from 'lucide-react';
import { PostCategory, PostTag } from '../../../types/blog.types';

interface BlogCategoryTagSectionProps {
  categoryId: number;
  selectedTagIds: number[];
  categories: PostCategory[];
  availableTags: PostTag[];
  onCategoryChange: (id: number) => void;
  onTagToggle: (tagId: number) => void;
}

export default function BlogCategoryTagSection({
  categoryId,
  selectedTagIds,
  categories,
  availableTags,
  onCategoryChange,
  onTagToggle,
}: BlogCategoryTagSectionProps) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <h2 className="text-sm font-bold text-[#202224]">Chuyên mục & Thẻ tag</h2>

      {/* Category Select */}
      <div className="space-y-1.5">
        <label
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wide"
          htmlFor="post-category"
        >
          <Folder className="w-3.5 h-3.5" />
          Chuyên mục <span className="text-red-500">*</span>
        </label>
        <select
          id="post-category"
          value={categoryId}
          onChange={(e) => onCategoryChange(Number(e.target.value))}
          className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all cursor-pointer"
        >
          <option value={0} disabled>
            -- Chọn chuyên mục --
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags Multi-select */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wide">
          <Tag className="w-3.5 h-3.5" />
          Thẻ tag
        </label>
        {availableTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onTagToggle(tag.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#4880FF] text-white border-[#4880FF] shadow-sm shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-[#4880FF] hover:text-[#4880FF]'
                  }`}
                >
                  #{tag.name}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Chưa có tag nào được tạo</p>
        )}
      </div>
    </div>
  );
}
