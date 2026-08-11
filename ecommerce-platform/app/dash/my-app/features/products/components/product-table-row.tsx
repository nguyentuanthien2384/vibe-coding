'use client';

import Image from 'next/image';
import { Edit3, Trash2, Box } from 'lucide-react';
import { ProductItem } from '../types/product.types';
import ProductStatusBadge from './product-status-badge';
import { useState } from 'react';

interface ProductTableRowProps {
  product: ProductItem;
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
}

export default function ProductTableRow({ product, onEdit, onDelete }: ProductTableRowProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <tr className="hover:bg-slate-50/80 transition-all duration-200 group">
      {/* Image */}
      <td className="px-6 py-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center p-1 border border-slate-200 overflow-hidden relative shadow-inner">
          {!imgError && product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={56}
              height={56}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <Box className="w-6 h-6 text-slate-400" />
          )}
        </div>
      </td>

      {/* Product Name & Slug */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 group-hover:text-[#4880FF] transition-colors line-clamp-1">
            {product.name}
          </span>
          <span className="text-xs text-slate-400 font-mono mt-0.5">/{product.slug}</span>
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
          {product.categoryName}
        </span>
      </td>

      {/* Price */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-extrabold text-[#4880FF] text-base">
            ${(product.salePrice ?? product.price).toLocaleString()}
          </span>
          {product.salePrice && product.salePrice < product.price && (
            <span className="text-xs text-slate-400 line-through">
              ${product.price.toLocaleString()}
            </span>
          )}
        </div>
      </td>

      {/* Stock */}
      <td className="px-6 py-4 text-center">
        <span
          className={`font-extrabold text-sm ${
            product.stock === 0 ? 'text-red-500' : 'text-slate-800'
          }`}
        >
          {product.stock}
        </span>
      </td>

      {/* Colors */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          {product.colors && product.colors.length > 0 ? (
            product.colors.map((color, idx) => (
              <span
                key={idx}
                className="w-4 h-4 rounded-full border border-slate-300 shadow-xs cursor-pointer hover:scale-125 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <ProductStatusBadge status={product.status} />
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-slate-400 hover:text-[#4880FF] hover:bg-blue-50 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer"
            title="Chỉnh sửa"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
