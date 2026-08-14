'use client';

import { BannerSettingItem } from '../../types/settings.types';
import { getImageUrl } from '../../../../lib/image-url';
import {
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  GripVertical,
} from 'lucide-react';

interface BannerItemCardProps {
  banner: BannerSettingItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onToggleActive: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEdit: (banner: BannerSettingItem) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const BannerItemCard = ({
  banner,
  index,
  isFirst,
  isLast,
  isDragging = false,
  isDragOver = false,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: BannerItemCardProps) => {
  const getCategoryBadge = (category: 'HOME' | 'PRODUCT') => {
    if (category === 'HOME') {
      return {
        style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        label: '🏠 Trang chủ',
      };
    }
    return {
      style: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      label: '📦 Trang sản phẩm',
    };
  };

  const getPositionBadge = (position: string) => {
    switch (position) {
      case 'HERO_BANNER':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
      case 'PROMOTION_BANNER':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
      case 'POPUP_BANNER':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const categoryBadge = getCategoryBadge(banner.category);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`rounded-xl border p-4 transition-all duration-200 space-y-4 cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'opacity-40 border-dashed border-[#4880FF] bg-blue-50/20 dark:bg-blue-950/20 scale-[0.99]'
          : isDragOver
          ? 'border-2 border-[#4880FF] bg-blue-50/50 dark:bg-slate-800/80 shadow-md scale-[1.01]'
          : 'bg-gray-50/60 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Drag Handle, Image & Info */}
        <div className="flex items-center gap-3">
          {/* Grip Vertical Handle */}
          <div className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0">
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Image */}
          <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex-shrink-0">
            {banner.imageUrl ? (
              <img
                src={getImageUrl(banner.imageUrl)}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
            <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              #{banner.order}
            </span>
          </div>

          {/* Banner Meta Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${categoryBadge.style}`}>
                {categoryBadge.label}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPositionBadge(
                  banner.position
                )}`}
              >
                {banner.position}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {banner.title}
              </h3>
            </div>
            {banner.subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {banner.subtitle}
              </p>
            )}
            {banner.targetUrl && (
              <a
                href={banner.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#4880FF] hover:underline flex items-center gap-1 font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                {banner.targetUrl}
              </a>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Order Move Up/Down Buttons */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-1">
            <button
              type="button"
              disabled={isFirst}
              onClick={() => onMoveUp(banner.id)}
              title="Di chuyển lên trên"
              className="p-1 text-slate-500 hover:text-[#4880FF] disabled:opacity-30 disabled:hover:text-slate-500 rounded transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={() => onMoveDown(banner.id)}
              title="Di chuyển xuống dưới"
              className="p-1 text-slate-500 hover:text-[#4880FF] disabled:opacity-30 disabled:hover:text-slate-500 rounded transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Switch */}
          <label className="relative inline-flex items-center cursor-pointer" title="Bật/tắt trạng thái hiển thị">
            <input
              type="checkbox"
              checked={banner.isActive}
              onChange={() => onToggleActive(banner.id)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(banner)}
            title="Chỉnh sửa Banner"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#4880FF] dark:hover:text-[#4880FF] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(banner.id)}
            title="Xóa Banner"
            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerItemCard;
