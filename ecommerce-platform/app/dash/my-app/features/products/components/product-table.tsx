import { ProductItem } from '../types/product.types';
import ProductTableRow from './product-table-row';
import { PackageOpen } from 'lucide-react';

interface ProductTableProps {
  products: ProductItem[];
  onDelete: (product: ProductItem) => void;
  onCategoryClick: (categoryName: string) => void;
}

export default function ProductTable({
  products,
  onDelete,
  onCategoryClick,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#202224]">Không tìm thấy sản phẩm</h3>
        <p className="text-sm text-gray-400 max-w-sm">
          Thử thay đổi từ khóa tìm kiếm hoặc chọn lại bộ lọc danh mục/trạng thái.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl custom-shadow overflow-hidden border border-gray-50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/80 text-xs font-extrabold text-gray-500 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Ảnh</th>
              <th className="px-6 py-4">Tên sản phẩm & Slug</th>
              <th className="px-6 py-4">Chuyên mục</th>
              <th className="px-6 py-4">Giá bán</th>
              <th className="px-6 py-4 text-center">Tồn kho</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onDelete={onDelete}
                onCategoryClick={onCategoryClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
