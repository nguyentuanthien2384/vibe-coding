'use client';

import { useState } from 'react';
import { MenuSettingItem, MenuLocation } from '../../types/settings.types';
import MenuItemRow from './menu-item-row';
import MenuModalForm from '../modals/menu-modal-form';
import { Menu, Plus, Filter } from 'lucide-react';

interface MenuRepeaterManagerProps {
  menus: MenuSettingItem[];
  onChange: (updatedMenus: MenuSettingItem[]) => void;
}

const MenuRepeaterManager = ({ menus, onChange }: MenuRepeaterManagerProps) => {
  const [filterLocation, setFilterLocation] = useState<MenuLocation | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuSettingItem | null>(null);

  const filteredMenus = menus
    .filter((m) => filterLocation === 'ALL' || m.location === filterLocation)
    .sort((a, b) => a.order - b.order);

  const handleToggleActive = (id: string) => {
    const updated = menus.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m));
    onChange(updated);
  };

  const handleMoveUp = (id: string) => {
    const index = filteredMenus.findIndex((m) => m.id === id);
    if (index <= 0) return;

    const current = filteredMenus[index];
    const prev = filteredMenus[index - 1];

    // Swap order
    const updated = menus.map((m) => {
      if (m.id === current.id) return { ...m, order: prev.order };
      if (m.id === prev.id) return { ...m, order: current.order };
      return m;
    });

    onChange(updated);
  };

  const handleMoveDown = (id: string) => {
    const index = filteredMenus.findIndex((m) => m.id === id);
    if (index < 0 || index >= filteredMenus.length - 1) return;

    const current = filteredMenus[index];
    const next = filteredMenus[index + 1];

    // Swap order
    const updated = menus.map((m) => {
      if (m.id === current.id) return { ...m, order: next.order };
      if (m.id === next.id) return { ...m, order: current.order };
      return m;
    });

    onChange(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa Menu này không?')) {
      const updated = menus.filter((m) => m.id !== id);
      onChange(updated);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (menu: MenuSettingItem) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleSaveMenu = (savedMenu: MenuSettingItem) => {
    const exists = menus.some((m) => m.id === savedMenu.id);
    let updated: MenuSettingItem[];

    if (exists) {
      updated = menus.map((m) => (m.id === savedMenu.id ? savedMenu : m));
    } else {
      updated = [...menus, { ...savedMenu, order: menus.length + 1 }];
    }

    onChange(updated);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Menu className="w-5 h-5 text-[#4880FF]" />
            Quản lý Menu Navigation (Repeater)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý thanh điều hướng Header Navbar và các cột liên kết Footer ngoài khách hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex flex-row items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4880FF] hover:bg-[#3b6edc] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap flex-shrink-0"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span>Thêm Menu Mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Vùng:</span>
        {(['ALL', 'HEADER', 'FOOTER_COL1', 'FOOTER_COL2', 'FOOTER_COL3'] as const).map((loc) => (
          <button
            key={loc}
            onClick={() => setFilterLocation(loc)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterLocation === loc
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-gray-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-200'
            }`}
          >
            {loc === 'ALL'
              ? 'Tất cả'
              : loc === 'HEADER'
              ? 'Header Nav'
              : loc === 'FOOTER_COL1'
              ? 'Footer Cột 1'
              : loc === 'FOOTER_COL2'
              ? 'Footer Cột 2'
              : 'Footer Cột 3'}
          </button>
        ))}
      </div>

      {/* Menu List */}
      {filteredMenus.length > 0 ? (
        <div className="space-y-3">
          {filteredMenus.map((menu, index) => (
            <MenuItemRow
              key={menu.id}
              menu={menu}
              isFirst={index === 0}
              isLast={index === filteredMenus.length - 1}
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
          <Menu className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Chưa có Menu item nào cho khu vực này
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Bấm vào nút "Thêm Menu Mới" ở trên để khởi tạo liên kết menu đầu tiên.
          </p>
        </div>
      )}

      {/* Modal Form */}
      <MenuModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuToEdit={editingMenu}
        onSave={handleSaveMenu}
      />
    </div>
  );
};

export default MenuRepeaterManager;
