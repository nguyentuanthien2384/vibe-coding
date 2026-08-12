'use client';

import { ProductItem, ProductFormData } from '../types/product.types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  productToEdit?: ProductItem | null;
  categoriesList: Array<{ id: string; name: string }>;
}

export default function ProductFormModal({
  isOpen,
  onClose,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
        <h3 className="text-lg font-bold">Chuyển sang trang form riêng biệt</h3>
        <p className="text-sm text-gray-500">
          Form thêm/sửa sản phẩm đã được chuyển sang trang riêng `/products/create` và `/products/[id]/edit` theo đúng thiết kế 02-product-idea.md.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 bg-[#4880FF] text-white rounded-xl font-bold text-sm"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
