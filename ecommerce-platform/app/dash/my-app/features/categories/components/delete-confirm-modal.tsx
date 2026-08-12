'use client';

import { AlertTriangle, X, Loader2 } from 'lucide-react';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  categoryName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = ({
  isOpen,
  categoryName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2
                id="delete-modal-title"
                className="text-base font-extrabold text-gray-900"
              >
                Xác nhận xóa
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Hành động này không thể hoàn tác</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Bạn có chắc chắn muốn xóa chuyên mục{' '}
          <span className="font-bold text-gray-900">&ldquo;{categoryName}&rdquo;</span> không?
          Hành động này sẽ bị từ chối nếu chuyên mục còn sản phẩm hoặc chuyên mục con.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            id="btn-cancel-delete"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            id="btn-confirm-delete"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-xl transition-all shadow-sm shadow-red-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
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
};

export default DeleteConfirmModal;
