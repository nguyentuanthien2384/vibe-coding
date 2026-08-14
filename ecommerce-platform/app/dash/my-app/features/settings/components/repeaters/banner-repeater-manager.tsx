'use client';

import { useState } from 'react';
import { BannerSettingItem, BannerPosition, BannerCategory } from '../../types/settings.types';
import BannerItemCard from './banner-item-card';
import BannerModalForm from '../modals/banner-modal-form';
import { Image as ImageIcon, Plus, Filter, Home, Box } from 'lucide-react';

interface BannerRepeaterManagerProps {
  banners: BannerSettingItem[];
  onChange: (updatedBanners: BannerSettingItem[]) => void;
}

const BannerRepeaterManager = ({ banners, onChange }: BannerRepeaterManagerProps) => {
  const [filterCategory, setFilterCategory] = useState<BannerCategory | 'ALL'>('ALL');
  const [filterPosition, setFilterPosition] = useState<BannerPosition | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSettingItem | null>(null);

  const filteredBanners = banners
    .filter((b) => filterCategory === 'ALL' || b.category === filterCategory)
    .filter((b) => filterPosition === 'ALL' || b.position === filterPosition)
    .sort((a, b) => a.order - b.order);

  const handleToggleActive = (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b));
    onChange(updated);
  };

  const handleMoveUp = (id: string) => {
    const index = filteredBanners.findIndex((b) => b.id === id);
    if (index <= 0) return;

    const current = filteredBanners[index];
    const prev = filteredBanners[index - 1];

    // Swap order
    const updated = banners.map((b) => {
      if (b.id === current.id) return { ...b, order: prev.order };
      if (b.id === prev.id) return { ...b, order: current.order };
      return b;
    });

    onChange(updated);
  };

  const handleMoveDown = (id: string) => {
    const index = filteredBanners.findIndex((b) => b.id === id);
    if (index < 0 || index >= filteredBanners.length - 1) return;

    const current = filteredBanners[index];
    const next = filteredBanners[index + 1];

    // Swap order
    const updated = banners.map((b) => {
      if (b.id === current.id) return { ...b, order: next.order };
      if (b.id === next.id) return { ...b, order: current.order };
      return b;
    });

    onChange(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa Banner này không?')) {
      const updated = banners.filter((b) => b.id !== id);
      onChange(updated);
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

  const handleSaveBanner = (savedBanner: BannerSettingItem) => {
    const exists = banners.some((b) => b.id === savedBanner.id);
    let updated: BannerSettingItem[];

    if (exists) {
      updated = banners.map((b) => (b.id === savedBanner.id ? savedBanner : b));
    } else {
      updated = [...banners, { ...savedBanner, order: banners.length + 1 }];
    }

    onChange(updated);
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Phân loại banner theo trang (Home vs Product), sắp xếp thứ tự hiển thị và bật/tắt kích hoạt.
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

      {/* Banner List */}
      {filteredBanners.length > 0 ? (
        <div className="space-y-3">
          {filteredBanners.map((banner, index) => (
            <BannerItemCard
              key={banner.id}
              banner={banner}
              isFirst={index === 0}
              isLast={index === filteredBanners.length - 1}
              onToggleActive={handleToggleActive}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
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
