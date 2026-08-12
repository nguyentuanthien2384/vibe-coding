import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { ProductItem } from '../types/product.types';
import ProductStatusBadge from './product-status-badge';
import { getImageUrl } from '../../../lib/image-url';

interface ProductTableRowProps {
  product: ProductItem;
  onDelete: (product: ProductItem) => void;
  onCategoryClick: (categoryName: string) => void;
}

export default function ProductTableRow({
  product,
  onDelete,
  onCategoryClick,
}: ProductTableRowProps) {
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  const formattedSalePrice = product.salePrice
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(product.salePrice)
    : null;

  const resolvedImageUrl = getImageUrl(product.imageUrl) || '/placeholder-food.png';

  return (
    <tr className="table-row transition-all duration-300 border-b border-gray-100 hover:bg-gray-50/80">
      {/* 1. Thumbnail */}
      <td className="px-6 py-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center p-1 border border-gray-100 overflow-hidden shadow-inner relative group">
          <Image
            src={resolvedImageUrl}
            alt={product.name}
            width={56}
            height={56}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
        </div>
      </td>

      {/* 2. Product Name & Slug */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-[#202224] text-sm line-clamp-1">
            {product.name}
          </span>
          <span className="text-xs text-gray-400 font-mono mt-0.5">
            /{product.slug}
          </span>
        </div>
      </td>

      {/* 3. Category (Clickable filter) */}
      <td className="px-6 py-4">
        <button
          type="button"
          onClick={() => onCategoryClick(product.categoryName)}
          className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-[#4880FF] font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-1 group cursor-pointer"
          title={`Bấm để lọc theo danh mục ${product.categoryName}`}
        >
          <span>{product.categoryName}</span>
        </button>
      </td>

      {/* 4. Price & Sale Price */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          {formattedSalePrice ? (
            <>
              <span className="font-extrabold text-[#4880FF] text-base">
                {formattedSalePrice}
              </span>
              <span className="text-xs text-gray-400 line-through font-medium">
                {formattedPrice}
              </span>
            </>
          ) : (
            <span className="font-extrabold text-[#4880FF] text-base">
              {formattedPrice}
            </span>
          )}
        </div>
      </td>

      {/* 5. Stock */}
      <td className="px-6 py-4 text-center">
        <span
          className={`font-extrabold text-sm ${
            product.stock === 0
              ? 'text-red-500'
              : product.stock <= 10
              ? 'text-amber-500'
              : 'text-gray-700'
          }`}
        >
          {product.stock}
        </span>
      </td>

      {/* 6. Status */}
      <td className="px-6 py-4">
        <ProductStatusBadge status={product.status || (product.isActive ? 'ACTIVE' : 'INACTIVE')} />
      </td>

      {/* 7. Action Buttons */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Edit button -> Page /products/[id]/edit */}
          <Link
            href={`/products/${product.id}/edit`}
            className="p-2 text-gray-400 hover:text-[#4880FF] hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
            title="Chỉnh sửa sản phẩm"
          >
            <Pencil className="w-4 h-4" />
          </Link>

          {/* Delete button -> Modal confirmation */}
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 cursor-pointer"
            title="Xóa sản phẩm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
