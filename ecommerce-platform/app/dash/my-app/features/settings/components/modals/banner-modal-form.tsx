'use client';

import { useState, useEffect } from 'react';
import { BannerSettingItem, BannerPosition, BannerCategory } from '../../types/settings.types';
import { ImageUploader } from '../../../../components/ui/image-uploader';
import { X, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';

interface BannerModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  bannerToEdit?: BannerSettingItem | null;
  onSave: (banner: BannerSettingItem) => void;
}

const BannerModalForm = ({
  isOpen,
  onClose,
  bannerToEdit,
  onSave,
}: BannerModalFormProps) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [category, setCategory] = useState<BannerCategory>('HOME');
  const [position, setPosition] = useState<BannerPosition>('HERO_BANNER');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (bannerToEdit) {
      setTitle(bannerToEdit.title);
      setSubtitle(bannerToEdit.subtitle || '');
      setImageUrl(bannerToEdit.imageUrl);
      setTargetUrl(bannerToEdit.targetUrl || '');
      setCategory(bannerToEdit.category || 'HOME');
      setPosition(bannerToEdit.position);
      setIsActive(bannerToEdit.isActive);
    } else {
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setTargetUrl('');
      setCategory('HOME');
      setPosition('HERO_BANNER');
      setIsActive(true);
    }
  }, [bannerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const newBanner: BannerSettingItem = {
      id: bannerToEdit ? bannerToEdit.id : `b-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      imageUrl: imageUrl.trim(),
      targetUrl: targetUrl.trim() || undefined,
      category,
      position,
      order: bannerToEdit ? bannerToEdit.order : 999,
      isActive,
    };

    onSave(newBanner);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#4880FF]" />
            {bannerToEdit ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category (Home vs Product) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Loại Banner (Trang hiển thị) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('HOME')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  category === 'HOME'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 shadow-sm'
                    : 'bg-gray-50 text-slate-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-gray-100'
                }`}
              >
                🏠 Banner Trang Chủ
              </button>

              <button
                type="button"
                onClick={() => setCategory('PRODUCT')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  category === 'PRODUCT'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700 shadow-sm'
                    : 'bg-gray-50 text-slate-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-gray-100'
                }`}
              >
                📦 Banner Trang Sản Phẩm
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tiêu Đề Banner <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Đại tiệc công nghệ TechBite..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mô Tả Phụ (Subtitle)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ví dụ: Giảm tới 50% cho bộ quà tặng..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
            />
          </div>

          {/* Banner Position */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Vị Trí Hiển Thị Chi Tiết
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as BannerPosition)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
            >
              <option value="HERO_BANNER">Hero Banner (Đầu trang)</option>
              <option value="PROMOTION_BANNER">Promotion Banner (Banner khuyến mãi giữa)</option>
              <option value="POPUP_BANNER">Popup Banner (Cửa sổ thông báo)</option>
            </select>
          </div>

          {/* Target URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Đường Dẫn Khi Click (Target URL)
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="/products?discount=true"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Image Uploader */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Hình Ảnh Banner <span className="text-rose-500">*</span>
            </label>
            <ImageUploader
              value={imageUrl}
              onChange={(url: string) => setImageUrl(url)}
            />
          </div>

          {/* Active Switch */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Trạng thái kích hoạt hiển thị
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4880FF]"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#4880FF] hover:bg-[#3b6edc] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
            >
              <Check className="w-4 h-4" />
              {bannerToEdit ? 'Lưu cập nhật' : 'Tạo Banner mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerModalForm;
