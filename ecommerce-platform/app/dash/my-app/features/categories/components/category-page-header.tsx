'use client';

import { Plus, Tag } from 'lucide-react';

export interface CategoryPageHeaderProps {
  onAddClick: () => void;
}

const CategoryPageHeader = ({ onAddClick }: CategoryPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Tag className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Quản lý Chuyên mục
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">
            Thêm, sửa, xóa và phân loại chuyên mục sản phẩm
          </p>
        </div>
      </div>

      <button
        id="btn-add-category"
        onClick={onAddClick}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-200"
      >
        <Plus className="w-4 h-4" />
        Thêm chuyên mục
      </button>
    </div>
  );
};

export default CategoryPageHeader;
