'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2, ExternalLink, Tag } from 'lucide-react';
import { Category } from '../types/category.types';
import StatusBadge from './status-badge';
import { getImageUrl } from '../../../lib/image-url';

export interface CategoryTableRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

const CategoryTableRow = ({ category, onEdit, onDelete }: CategoryTableRowProps) => {
  const renderCategoryIcon = () => {
    const rawIcon = category.iconUrl?.trim();
    if (!rawIcon) {
      return <Tag className="w-5 h-5 text-gray-300" />;
    }

    const isImage =
      rawIcon.startsWith('/') ||
      rawIcon.startsWith('http://') ||
      rawIcon.startsWith('https://') ||
      rawIcon.startsWith('data:') ||
      rawIcon.includes('/uploads/') ||
      /\.(png|jpg|jpeg|webp|svg)($|\?)/i.test(rawIcon);

    if (isImage) {
      const fullUrl = getImageUrl(rawIcon);
      return (
        <Image
          src={fullUrl}
          alt={category.name}
          width={40}
          height={40}
          unoptimized
          className="object-contain hover:scale-110 transition-transform duration-500"
        />
      );
    }

    return <span className="text-xl leading-none">{rawIcon}</span>;
  };

  return (
    <tr className="transition-colors duration-200 hover:bg-gray-50/80 border-b border-gray-100 last:border-b-0">
      {/* Icon */}
      <td className="px-6 py-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
          {renderCategoryIcon()}
        </div>
      </td>

      {/* Tên */}
      <td className="px-6 py-4">
        <p className="font-bold text-gray-800 text-sm">{category.name}</p>
        <p className="text-xs text-gray-400 font-medium mt-0.5">/{category.slug}</p>
      </td>

      {/* Chuyên mục cha */}
      <td className="px-6 py-4">
        {category.parentName ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-lg">
            {category.parentName}
          </span>
        ) : (
          <span className="text-sm text-gray-300 font-medium italic">Chuyên mục gốc</span>
        )}
      </td>

      {/* Số sản phẩm */}
      <td className="px-6 py-4 text-center">
        <span className="font-extrabold text-gray-700 text-sm">{category.productCount}</span>
      </td>

      {/* Trạng thái */}
      <td className="px-6 py-4">
        <StatusBadge isActive={category.isActive} />
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/categories/${category.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Xem trên frontend"
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            id={`btn-edit-${category.id}`}
            onClick={() => onEdit(category)}
            title="Sửa chuyên mục"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            id={`btn-delete-${category.id}`}
            onClick={() => onDelete(category.id)}
            title="Xóa chuyên mục"
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CategoryTableRow;
