'use client';

import Image from 'next/image';
import { AlertTriangle, X } from 'lucide-react';
import { ProductItem } from '../types/product.types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: ProductItem | null;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}: DeleteConfirmModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 p-6 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-3">
          <h3 className="text-xl font-extrabold text-[#202224]">
            Xác nhận xóa sản phẩm?
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            Hành động này sẽ gỡ bỏ sản phẩm khỏi danh sách hiển thị hệ thống.
          </p>

          {/* Target Product Box */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-gray-200 overflow-hidden relative flex-shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={48}
                height={48}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#202224] truncate">
                {product.name}
              </h4>
              <p className="text-xs text-gray-400 font-mono">ID: {product.id}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-200 active:scale-95"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}
