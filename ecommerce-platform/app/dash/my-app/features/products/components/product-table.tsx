'use client';

import { ProductItem } from '../types/product.types';
import ProductTableRow from './product-table-row';
import { BoxSelect } from 'lucide-react';

interface ProductTableProps {
  products: ProductItem[];
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <BoxSelect className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Không tìm thấy sản phẩm nào</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để xem kết quả khác.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Hình ảnh</th>
              <th className="px-6 py-4">Tên sản phẩm</th>
              <th className="px-6 py-4">Danh mục</th>
              <th className="px-6 py-4">Giá bán</th>
              <th className="px-6 py-4 text-center">Tồn kho</th>
              <th className="px-6 py-4">Màu sắc</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
