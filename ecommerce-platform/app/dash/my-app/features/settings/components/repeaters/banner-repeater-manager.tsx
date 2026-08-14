'use client';

import { useState } from 'react';
import { BannerSettingItem, BannerPosition, BannerCategory } from '../../types/settings.types';
import BannerItemCard from './banner-item-card';
import BannerModalForm from '../modals/banner-modal-form';
import { Image as ImageIcon, Plus, Filter, Home, Box, Move } from 'lucide-react';
import {
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
  reorderAdminBanners,
} from '../../api/settings-api';

interface BannerRepeaterManagerProps {
  banners: BannerSettingItem[];
  onChange: (updatedBanners: BannerSettingItem[]) => void;
}

const BannerRepeaterManager = ({ banners, onChange }: BannerRepeaterManagerProps) => {
  const [filterCategory, setFilterCategory] = useState<BannerCategory | 'ALL'>('ALL');
  const [filterPosition, setFilterPosition] = useState<BannerPosition | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSettingItem | null>(null);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const filteredBanners = banners
    .filter((b) => filterCategory === 'ALL' || b.category === filterCategory)
    .filter((b) => filterPosition === 'ALL' || b.position === filterPosition)
    .sort((a, b) => a.order - b.order);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedFiltered = [...filteredBanners];
    const [movedItem] = reorderedFiltered.splice(draggedIndex, 1);
    reorderedFiltered.splice(dropIndex, 0, movedItem);

    // Re-assign order numbers 1, 2, 3...
    const updatedFiltered = reorderedFiltered.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    // Update full banners list
    const updatedMap = new Map(updatedFiltered.map((b) => [b.id, b]));
    const updatedAllBanners = banners.map((b) => updatedMap.get(b.id) || b);

    onChange(updatedAllBanners);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Call API to persist new order to backend MySQL
    try {
      await reorderAdminBanners(
        updatedAllBanners.map((b) => ({ id: b.id, order: b.order })),
      );
    } catch (error) {
      console.error('Lỗi khi lưu vị trí kéo thả banner:', error);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleToggleActive = async (id: string) => {
    const target = banners.find((b) => b.id === id);
    if (!target) return;
    const newStatus = !target.isActive;
    const updated = banners.map((b) => (b.id === id ? { ...b, isActive: newStatus } : b));
    onChange(updated);

    try {
      await updateAdminBanner(id, { isActive: newStatus });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái banner:', error);
    }
  };

  const handleMoveUp = async (id: string) => {
    const index = filteredBanners.findIndex((b) => b.id === id);
    if (index <= 0) return;

    const current = filteredBanners[index];
    const prev = filteredBanners[index - 1];

    const updated = banners.map((b) => {
      if (b.id === current.id) return { ...b, order: prev.order };
      if (b.id === prev.id) return { ...b, order: current.order };
      return b;
    });

    onChange(updated);

    try {
      await reorderAdminBanners(
        updated.map((b) => ({ id: b.id, order: b.order })),
      );
    } catch (error) {
      console.error('Lỗi khi sắp xếp thứ tự banner:', error);
    }
  };

  const handleMoveDown = async (id: string) => {
    const index = filteredBanners.findIndex((b) => b.id === id);
    if (index < 0 || index >= filteredBanners.length - 1) return;

    const current = filteredBanners[index];
    const next = filteredBanners[index + 1];

    const updated = banners.map((b) => {
      if (b.id === current.id) return { ...b, order: next.order };
      if (b.id === next.id) return { ...b, order: current.order };
      return b;
    });

    onChange(updated);

    try {
      await reorderAdminBanners(
        updated.map((b) => ({ id: b.id, order: b.order })),
      );
    } catch (error) {
      console.error('Lỗi khi sắp xếp thứ tự banner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa Banner này không? File ảnh vật lý cũng sẽ bị xóa vĩnh viễn.')) {
      const updated = banners.filter((b) => b.id !== id);
      onChange(updated);

      try {
        await deleteAdminBanner(id);
      } catch (error) {
        console.error('Lỗi khi xóa banner:', error);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: BannerSettingItem) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (savedBanner: BannerSettingItem) => {
    const isEditing = banners.some((b) => b.id === savedBanner.id);

    try {
      if (isEditing) {
        const updatedItem = await updateAdminBanner(savedBanner.id, savedBanner);
        const updated = banners.map((b) => (b.id === savedBanner.id ? updatedItem : b));
        onChange(updated);
      } else {
        const newItem = await createAdminBanner(savedBanner);
        onChange([...banners, newItem]);
      }
    } catch (error) {
      console.error('Lỗi khi lưu banner:', error);
      if (isEditing) {
        onChange(banners.map((b) => (b.id === savedBanner.id ? savedBanner : b)));
      } else {
        onChange([...banners, { ...savedBanner, order: banners.length + 1 }]);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#4880FF]" />
            Quản lý Banner Quảng Cáo (Trang Chủ & Trang Sản Phẩm)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-[#4880FF]" />
            <span>Kéo thả thẻ banner để thay đổi thứ tự trực quan hoặc dùng nút mũi tên.</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex flex-row items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4880FF] hover:bg-[#3b6edc] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap flex-shrink-0"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span>Thêm Banner Mới</span>
        </button>
      </div>

      {/* Filter Category Tabs (Home vs Product) */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setFilterCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterCategory === 'ALL'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Tất cả loại ({banners.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('HOME')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterCategory === 'HOME'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          Banner Trang Chủ ({banners.filter((b) => b.category === 'HOME').length})
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('PRODUCT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterCategory === 'PRODUCT'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50/50'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          Banner Trang Sản Phẩm ({banners.filter((b) => b.category === 'PRODUCT').length})
        </button>
      </div>

      {/* Filter Position */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Vị trí:</span>
        {(['ALL', 'HERO_BANNER', 'PROMOTION_BANNER', 'POPUP_BANNER'] as const).map((pos) => (
          <button
            key={pos}
            onClick={() => setFilterPosition(pos)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterPosition === pos
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-gray-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-200'
            }`}
          >
            {pos === 'ALL'
              ? 'Tất cả vị trí'
              : pos === 'HERO_BANNER'
              ? 'Hero Banner'
              : pos === 'PROMOTION_BANNER'
              ? 'Khuyến mãi'
              : 'Popup'}
          </button>
        ))}
      </div>

      {/* Banner List (Drag and Drop Enabled) */}
      {filteredBanners.length > 0 ? (
        <div className="space-y-3">
          {filteredBanners.map((banner, index) => (
            <BannerItemCard
              key={banner.id}
              banner={banner}
              index={index}
              isFirst={index === 0}
              isLast={index === filteredBanners.length - 1}
              isDragging={draggedIndex === index}
              isDragOver={dragOverIndex === index}
              onToggleActive={handleToggleActive}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
          <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Chưa có Banner nào phù hợp với bộ lọc đã chọn
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Bấm vào nút "Thêm Banner Mới" ở trên để khởi tạo banner đầu tiên.
          </p>
        </div>
      )}

      {/* Modal Form */}
      <BannerModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bannerToEdit={editingBanner}
        onSave={handleSaveBanner}
      />
    </div>
  );
};

export default BannerRepeaterManager;
