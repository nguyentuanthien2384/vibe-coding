'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { BlogPostListItem } from '../../types/blog.types';

interface DeletePostConfirmModalProps {
  isOpen: boolean;
  post: BlogPostListItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeletePostConfirmModal({
  isOpen,
  post,
  isDeleting,
  onClose,
  onConfirm,
}: DeletePostConfirmModalProps) {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-post-modal-title"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h2 id="delete-post-modal-title" className="text-lg font-bold text-[#202224]">
            Xác nhận xóa bài viết
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Bạn có chắc muốn xóa bài viết{' '}
            <span className="font-bold text-[#202224] line-clamp-1 inline-block max-w-[220px] align-bottom">
              &quot;{post.title}&quot;
            </span>
            ? Hành động này{' '}
            <span className="font-bold text-red-600">không thể hoàn tác</span>.
          </p>
        </div>

        {/* Actions */}
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
              'Xóa bài viết'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
