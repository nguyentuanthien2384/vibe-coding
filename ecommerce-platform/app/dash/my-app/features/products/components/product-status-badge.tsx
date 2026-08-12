import { ProductStatus } from '../types/product.types';

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

export default function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-green-100 text-green-700 tracking-wide">
        ● Đang bán
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-gray-100 text-gray-500 tracking-wide">
      ○ Tạm ẩn
    </span>
  );
}
