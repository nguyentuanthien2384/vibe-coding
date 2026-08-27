'use client';

import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { usePermissions } from '../../../../hooks/use-permissions';

interface BlogCategoryPageHeaderProps {
  totalCount: number;
  onOpenCreate: () => void;
}

export default function BlogCategoryPageHeader({ totalCount, onOpenCreate }: BlogCategoryPageHeaderProps) {
  const { hasAnyPermission } = usePermissions();
  const canManageCategory = hasAnyPermission(['blog.category_manage', 'blog.manage', 'category.manage']);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/blog"
          className="p-2 text-gray-400 hover:text-[#202224] hover:bg-gray-100 rounded-xl transition-all"
          title="Quay lại danh sách bài viết"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202224]">
            Chuyên mục Bài viết
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý và sắp xếp chuyên mục cho blog
            {totalCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-50 text-[#4880FF] font-bold rounded-lg text-xs">
                {totalCount} chuyên mục
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Right: Add button - hidden if no permission */}
      {canManageCategory && (
        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4880FF] hover:bg-blue-600 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Thêm chuyên mục
        </button>
      )}
    </div>
  );
}
