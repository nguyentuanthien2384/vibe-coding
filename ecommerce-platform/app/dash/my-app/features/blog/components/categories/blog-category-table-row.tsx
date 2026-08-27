'use client';

import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { PostCategory } from '../../types/blog.types';
import { usePermissions } from '../../../../hooks/use-permissions';

interface BlogCategoryTableRowProps {
  category: PostCategory;
  onEditClick: (category: PostCategory) => void;
  onDeleteClick: (category: PostCategory) => void;
  onToggleActive: (categoryId: number, currentActive: boolean) => void;
}

export default function BlogCategoryTableRow({
  category,
  onEditClick,
  onDeleteClick,
  onToggleActive,
}: BlogCategoryTableRowProps) {
  const { hasAnyPermission } = usePermissions();
  const canManageCategory = hasAnyPermission(['blog.category_manage', 'blog.manage', 'category.manage']);

  return (
    <tr className="border-b border-gray-100 hover:bg-[#F9FAFB] transition-colors duration-200">
      {/* 1. Icon */}
      <td className="px-6 py-4">
        <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl">
          {category.icon ?? '📁'}
        </div>
      </td>

      {/* 2. Name & Slug */}
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-sm text-[#202224]">{category.name}</span>
          <span className="text-xs text-gray-400 font-mono mt-0.5">/{category.slug}</span>
        </div>
      </td>

      {/* 3. Description */}
      <td className="px-4 py-4">
        <p className="text-xs text-gray-500 line-clamp-2 max-w-xs">{category.description ?? '—'}</p>
      </td>

      {/* 4. Post Count */}
      <td className="px-4 py-4 text-center">
        <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 bg-blue-50 text-[#4880FF] text-xs font-bold rounded-xl border border-blue-100">
          {category.postCount ?? 0}
        </span>
      </td>

      {/* 5. Order Index */}
      <td className="px-4 py-4 text-center">
        <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl">
          #{category.orderIndex}
        </span>
      </td>

      {/* 6. Active Toggle */}
      <td className="px-4 py-4">
        {canManageCategory ? (
          <button
            type="button"
            onClick={() => onToggleActive(category.id, category.isActive)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              category.isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {category.isActive ? (
              <ToggleRight className="w-3.5 h-3.5" />
            ) : (
              <ToggleLeft className="w-3.5 h-3.5" />
            )}
            {category.isActive ? 'Hoạt động' : 'Ẩn'}
          </button>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg ${
              category.isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            {category.isActive ? 'Hoạt động' : 'Ẩn'}
          </span>
        )}
      </td>

      {/* 7. Actions */}
      <td className="px-6 py-4 text-right">
        {canManageCategory ? (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEditClick(category)}
              className="p-2 text-gray-400 hover:text-[#4880FF] hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
              title="Chỉnh sửa"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteClick(category)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
    </tr>
  );
}
