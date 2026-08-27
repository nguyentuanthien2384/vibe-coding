'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { PostCategory } from '../../types/blog.types';

interface DeleteCategoryConfirmModalProps {
  isOpen: boolean;
  category: PostCategory | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteCategoryConfirmModal({
  isOpen,
  category,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteCategoryConfirmModalProps) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-cat-modal-title"
      >
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 id="delete-cat-modal-title" className="text-lg font-bold text-[#202224]">
            Xóa chuyên mục?
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Bạn có chắc muốn xóa chuyên mục{' '}
            <span className="font-bold text-[#202224]">
              {category.icon} &quot;{category.name}&quot;
            </span>
            ?{' '}
            {(category.postCount ?? 0) > 0 && (
              <span className="text-amber-600 font-semibold">
                Chuyên mục này có {category.postCount} bài viết.{' '}
              </span>
            )}
            Hành động này <span className="font-bold text-red-600">không thể hoàn tác</span>.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-200 transition-all disabled:opacity-70 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              'Xóa chuyên mục'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
