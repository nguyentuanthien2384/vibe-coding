import { ProductStatus } from '../types/product.types';

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

export default function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-green-500" />
        Đang bán
      </span>
    );
  }

  if (status === 'OUT_OF_STOCK') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-red-500" />
        Hết hàng
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-400" />
      Nháp
    </span>
  );
}
