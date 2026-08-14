'use client';

import { useState, useEffect } from 'react';
import { MenuSettingItem, MenuLocation } from '../../types/settings.types';
import { X, Menu, Link as LinkIcon, Check } from 'lucide-react';

interface MenuModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  menuToEdit?: MenuSettingItem | null;
  onSave: (menu: MenuSettingItem) => void;
}

const MenuModalForm = ({
  isOpen,
  onClose,
  menuToEdit,
  onSave,
}: MenuModalFormProps) => {
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [location, setLocation] = useState<MenuLocation>('HEADER');
  const [icon, setIcon] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (menuToEdit) {
      setTitle(menuToEdit.title);
      setTargetUrl(menuToEdit.targetUrl);
      setLocation(menuToEdit.location);
      setIcon(menuToEdit.icon || '');
      setOpenInNewTab(menuToEdit.openInNewTab);
      setIsActive(menuToEdit.isActive);
    } else {
      setTitle('');
      setTargetUrl('');
      setLocation('HEADER');
      setIcon('');
      setOpenInNewTab(false);
      setIsActive(true);
    }
  }, [menuToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetUrl.trim()) return;

    const newMenu: MenuSettingItem = {
      id: menuToEdit ? menuToEdit.id : `m-${Date.now()}`,
      title: title.trim(),
      targetUrl: targetUrl.trim(),
      location,
      icon: icon.trim() || undefined,
      order: menuToEdit ? menuToEdit.order : 999,
      openInNewTab,
      isActive,
    };

    onSave(newMenu);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Menu className="w-5 h-5 text-[#4880FF]" />
            {menuToEdit ? 'Chỉnh sửa Menu Item' : 'Thêm Menu Item mới'}
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
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tên Hiển Thị Menu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Trang chủ, Khuyến mãi..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
            />
          </div>

          {/* Target URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Đường Dẫn Đích (Target URL) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="/products hoặc https://..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white font-mono"
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Menu Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Vị Trí Vùng Hiển Thị
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as MenuLocation)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
            >
              <option value="HEADER">Header Navbar (Thanh điều hướng chính)</option>
              <option value="FOOTER_COL1">Footer - Cột 1 (Về TechBite)</option>
              <option value="FOOTER_COL2">Footer - Cột 2 (Chính sách & Hỗ trợ)</option>
              <option value="FOOTER_COL3">Footer - Cột 3 (Chuyên mục hot)</option>
            </select>
          </div>

          {/* Open in New Tab Switch */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mở liên kết trong tab mới (_blank)
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4880FF]"></div>
            </label>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between">
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
              {menuToEdit ? 'Lưu cập nhật' : 'Tạo Menu mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuModalForm;
