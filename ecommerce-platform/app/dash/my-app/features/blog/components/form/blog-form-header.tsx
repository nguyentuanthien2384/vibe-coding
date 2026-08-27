'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Eye } from 'lucide-react';
import { usePermissions } from '../../../../hooks/use-permissions';

interface BlogFormHeaderProps {
  mode: 'create' | 'edit';
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export default function BlogFormHeader({
  mode,
  isSubmitting,
  onSaveDraft,
  onPublish,
}: BlogFormHeaderProps) {
  const { hasAnyPermission } = usePermissions();

  const canSave =
    mode === 'create'
      ? hasAnyPermission(['blog.manage', 'blog.create'])
      : hasAnyPermission(['blog.manage', 'blog.edit']);

  const title = mode === 'create' ? 'Viết bài mới' : 'Chỉnh sửa bài viết';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200">
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
          <h1 className="text-xl font-extrabold text-[#202224]">{title}</h1>
          <p className="text-xs text-gray-400 mt-0.5">Soạn thảo nội dung và cấu hình xuất bản</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/blog"
          className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
        >
          Hủy bỏ
        </Link>
        {canSave && (
          <>
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Lưu nháp
            </button>
            <button
              type="button"
              onClick={onPublish}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#4880FF] hover:bg-blue-600 active:scale-95 rounded-xl shadow-md shadow-blue-200 transition-all disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Lưu & Xuất bản
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
