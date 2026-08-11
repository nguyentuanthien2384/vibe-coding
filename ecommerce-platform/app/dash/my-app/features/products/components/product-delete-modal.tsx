'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ProductItem } from '../types/product.types';

interface ProductDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product?: ProductItem | null;
}

export default function ProductDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}: ProductDeleteModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Xác nhận xóa sản phẩm</h3>
          <p className="text-sm text-slate-500 mt-1">
            Bạn có chắc chắn muốn xóa sản phẩm{' '}
            <span className="font-bold text-slate-900">"{product.name}"</span> không? Hành động
            này không thể hoàn tác.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa vĩnh viễn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
