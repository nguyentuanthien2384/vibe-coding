'use client';

import { Plus } from 'lucide-react';

interface ProductPageHeaderProps {
  onAddClick: () => void;
  totalCount: number;
}

export default function ProductPageHeader({ onAddClick, totalCount }: ProductPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Product Stock
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Quản lý toàn bộ danh sách {totalCount} sản phẩm trong hệ thống
        </p>
      </div>

      <button
        onClick={onAddClick}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4880FF] hover:bg-blue-600 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-95"
      >
        <Plus className="w-5 h-5" />
        <span>Thêm sản phẩm</span>
      </button>
    </div>
  );
}
