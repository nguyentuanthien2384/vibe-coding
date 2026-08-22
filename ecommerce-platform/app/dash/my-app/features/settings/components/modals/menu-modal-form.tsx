'use client';

import { useState, useEffect } from 'react';
import { MenuSettingItem, MenuLocation, SubMenuSettingItem } from '../../types/settings.types';
import { X, Menu, Link as LinkIcon, Check, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

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
  const [children, setChildren] = useState<SubMenuSettingItem[]>([]);

  // Submenu input state
  const [subTitle, setSubTitle] = useState('');
  const [subUrl, setSubUrl] = useState('');

  useEffect(() => {
    if (menuToEdit) {
      setTitle(menuToEdit.title);
      setTargetUrl(menuToEdit.targetUrl);
      setLocation(menuToEdit.location);
      setIcon(menuToEdit.icon || '');
      setOpenInNewTab(menuToEdit.openInNewTab);
      setIsActive(menuToEdit.isActive);
      setChildren(menuToEdit.children ? [...menuToEdit.children] : []);
    } else {
      setTitle('');
      setTargetUrl('');
      setLocation('HEADER');
      setIcon('');
      setOpenInNewTab(false);
      setIsActive(true);
      setChildren([]);
    }
    setSubTitle('');
    setSubUrl('');
  }, [menuToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubMenu = () => {
    if (!subTitle.trim() || !subUrl.trim()) return;
    const newSub: SubMenuSettingItem = {
      id: `sub-${Date.now()}`,
      title: subTitle.trim(),
      targetUrl: subUrl.trim(),
      order: children.length + 1,
      isActive: true,
    };
    setChildren([...children, newSub]);
    setSubTitle('');
    setSubUrl('');
  };

  const handleRemoveSubMenu = (id: string) => {
    setChildren(children.filter((c) => c.id !== id));
  };

  const handleMoveSubUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...children];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setChildren(updated.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  const handleMoveSubDown = (index: number) => {
    if (index >= children.length - 1) return;
    const updated = [...children];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setChildren(updated.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

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
      children: children.length > 0 ? children : undefined,
    };

    onSave(newMenu);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Menu className="w-5 h-5 text-[#4880FF]" />
            {menuToEdit ? 'Chỉnh sửa Menu Item' : 'Thêm Menu Item mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
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
              placeholder="Ví dụ: Trang chủ, Sản phẩm & Thực đơn..."
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
              <option value="FOOTER_COL1">Footer - Cột 1 (Danh mục / Thực đơn)</option>
              <option value="FOOTER_COL2">Footer - Cột 2 (Chính sách & Hỗ trợ)</option>
              <option value="FOOTER_COL3">Footer - Cột 3 (Chuyên mục hot / Liên kết)</option>
              <option value="MOBILE">Mobile Navigation Drawer</option>
            </select>
          </div>

          {/* Submenus Repeater (Menu con) */}
          {location === 'HEADER' && (
            <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                Menu Con (Dropdown Sub-menus) — Tuỳ chọn
              </label>

              {/* Existing Sub-menus List */}
              {children.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {children.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-2 p-2.5 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-[#4880FF] font-bold font-mono">#{idx + 1}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {sub.title}
                        </span>
                        <span className="text-slate-400 font-mono truncate text-[11px]">
                          ({sub.targetUrl})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSubUp(idx)}
                          className="p-1 text-slate-400 hover:text-[#4880FF] disabled:opacity-30 rounded"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === children.length - 1}
                          onClick={() => handleMoveSubDown(idx)}
                          className="p-1 text-slate-400 hover:text-[#4880FF] disabled:opacity-30 rounded"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubMenu(sub.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Sub-menu Inline Form */}
              <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="Tên menu con (vd: Burger)..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-[#4880FF]"
                />
                <input
                  type="text"
                  value={subUrl}
                  onChange={(e) => setSubUrl(e.target.value)}
                  placeholder="Đường dẫn (/categories/...)"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-[#4880FF]"
                />
                <button
                  type="button"
                  onClick={handleAddSubMenu}
                  className="px-3 py-2 bg-[#4880FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>
          )}

          {/* Open in New Tab Switch */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
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
              <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#4880FF]"></div>
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
              <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#4880FF]"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4880FF] hover:bg-[#3b6edc] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
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
