'use client';

import { Category } from '../types/category.types';
import CategoryTableRow from './category-table-row';
import { LayoutList } from 'lucide-react';

export interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

const CategoryTable = ({ categories, onEdit, onDelete }: CategoryTableProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                Icon
              </th>
              <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                Tên chuyên mục
              </th>
              <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                Chuyên mục cha
              </th>
              <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest text-center">
                Sản phẩm
              </th>
              <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest text-right">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-300">
                    <LayoutList className="w-12 h-12" />
                    <p className="text-sm font-semibold">Không tìm thấy chuyên mục nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <CategoryTableRow
                  key={category.id}
                  category={category}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryTable;
