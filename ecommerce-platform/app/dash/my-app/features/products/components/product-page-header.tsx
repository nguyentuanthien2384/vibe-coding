import Link from 'next/link';
import { Plus, Package } from 'lucide-react';

interface ProductPageHeaderProps {
  totalCount: number;
}

export default function ProductPageHeader({ totalCount }: ProductPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#202224]">
            Product Stock
          </h1>
          <span className="px-3 py-1 bg-blue-50 text-[#4880FF] text-xs font-extrabold rounded-full border border-blue-100 flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            {totalCount} sản phẩm
          </span>
        </div>
        <p className="text-sm text-gray-500 font-semibold mt-1">
          Quản lý danh sách sản phẩm, giá bán, tồn kho và các chuyên mục hệ thống
        </p>
      </div>

      {/* Link button to Dedicated Create Page /products/create */}
      <Link
        href="/products/create"
        className="inline-flex items-center justify-center gap-2 bg-[#4880FF] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200 hover:shadow-lg active:scale-95 text-sm"
      >
        <Plus className="w-5 h-5" />
        <span>Thêm sản phẩm mới</span>
      </Link>
    </div>
  );
}
