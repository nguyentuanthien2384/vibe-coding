'use client';

import Link from 'next/link';
import { Folder, Plus } from 'lucide-react';
import { usePermissions } from '../../../hooks/use-permissions';

interface BlogPageHeaderProps {
  totalCount: number;
}

export default function BlogPageHeader({ totalCount }: BlogPageHeaderProps) {
  const { hasAnyPermission } = usePermissions();

  const canManageCategory = hasAnyPermission(['blog.category_manage', 'blog.manage', 'category.manage']);
  const canCreatePost = hasAnyPermission(['blog.manage', 'blog.create']);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
      {/* Title Block */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202224]">
          Quản lý Bài viết & Tin tức
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý toàn bộ bài viết, tin tức và blog ẩm thực
          {totalCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-[#4880FF] font-bold rounded-lg text-xs">
              {totalCount} bài viết
            </span>
          )}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {canManageCategory && (
          <Link
            href="/blog/categories"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            <Folder className="w-4 h-4" />
            Chuyên mục
          </Link>
        )}
        {canCreatePost && (
          <Link
            href="/blog/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4880FF] hover:bg-blue-600 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Viết bài mới
          </Link>
        )}
      </div>
    </div>
  );
}
