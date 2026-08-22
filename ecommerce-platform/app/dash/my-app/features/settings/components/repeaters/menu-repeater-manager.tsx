'use client';

import { useState } from 'react';
import { MenuSettingItem, MenuLocation } from '../../types/settings.types';
import MenuItemRow from './menu-item-row';
import MenuModalForm from '../modals/menu-modal-form';
import { patchGroupSettings } from '../../api/settings-api';
import { Menu, Plus, Filter, Move, Loader2, CheckCircle } from 'lucide-react';

interface MenuRepeaterManagerProps {
  menus: MenuSettingItem[];
  onChange: (updatedMenus: MenuSettingItem[]) => void;
}

const MenuRepeaterManager = ({ menus, onChange }: MenuRepeaterManagerProps) => {
  const [filterLocation, setFilterLocation] = useState<MenuLocation | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuSettingItem | null>(null);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Auto-save feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const filteredMenus = menus
    .filter((m) => filterLocation === 'ALL' || m.location === filterLocation)
    .sort((a, b) => a.order - b.order);

  /** Gọi API lưu luôn, cập nhật feedback */
  const autoSave = async (updatedMenus: MenuSettingItem[]) => {
    onChange(updatedMenus);
    setSaveStatus('saving');
    try {
      await patchGroupSettings('menus', updatedMenus);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Lỗi khi tự động lưu menu:', error);
      setSaveStatus('idle');
    }
  };

  // ─── Drag and Drop Handlers ───────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
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

    const reordered = [...filteredMenus];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, movedItem);

    // Re-assign order 1, 2, 3...
    const updatedFiltered = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));

    // Merge back vào toàn bộ menus (giữ nguyên các items không trong filter)
    const updatedMap = new Map(updatedFiltered.map((m) => [m.id, m]));
    const updatedAll = menus.map((m) => updatedMap.get(m.id) || m);

    setDraggedIndex(null);
    setDragOverIndex(null);

    await autoSave(updatedAll);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleToggleActive = async (id: string) => {
    const updated = menus.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m));
    await autoSave(updated);
  };

  const handleMoveUp = async (id: string) => {
    const index = filteredMenus.findIndex((m) => m.id === id);
    if (index <= 0) return;

    const current = filteredMenus[index];
    const prev = filteredMenus[index - 1];
    const updated = menus.map((m) => {
      if (m.id === current.id) return { ...m, order: prev.order };
      if (m.id === prev.id) return { ...m, order: current.order };
      return m;
    });

    await autoSave(updated);
  };

  const handleMoveDown = async (id: string) => {
    const index = filteredMenus.findIndex((m) => m.id === id);
    if (index < 0 || index >= filteredMenus.length - 1) return;

    const current = filteredMenus[index];
    const next = filteredMenus[index + 1];
    const updated = menus.map((m) => {
      if (m.id === current.id) return { ...m, order: next.order };
      if (m.id === next.id) return { ...m, order: current.order };
      return m;
    });

    await autoSave(updated);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa Menu này không?')) {
      const updated = menus.filter((m) => m.id !== id);
      await autoSave(updated);
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

  const handleSaveMenu = async (savedMenu: MenuSettingItem) => {
    const exists = menus.some((m) => m.id === savedMenu.id);
    const updated = exists
      ? menus.map((m) => (m.id === savedMenu.id ? savedMenu : m))
      : [...menus, { ...savedMenu, order: menus.length + 1 }];

    await autoSave(updated);
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-[#4880FF] flex-shrink-0" />
            <span>Kéo thả để sắp xếp hoặc dùng nút mũi tên. Thay đổi được lưu tự động.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-save status */}
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang lưu...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Đã lưu</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex flex-row items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4880FF] hover:bg-[#3b6edc] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>Thêm Menu Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Vùng:</span>
        {(['ALL', 'HEADER', 'FOOTER_COL1', 'FOOTER_COL2', 'FOOTER_COL3', 'MOBILE'] as const).map(
          (loc) => (
            <button
              key={loc}
              onClick={() => setFilterLocation(loc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filterLocation === loc
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-gray-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-200'
              }`}
            >
              {loc === 'ALL'
                ? `Tất cả (${menus.length})`
                : loc === 'HEADER'
                ? `Header Nav (${menus.filter((m) => m.location === 'HEADER').length})`
                : loc === 'FOOTER_COL1'
                ? `Footer Cột 1 (${menus.filter((m) => m.location === 'FOOTER_COL1').length})`
                : loc === 'FOOTER_COL2'
                ? `Footer Cột 2 (${menus.filter((m) => m.location === 'FOOTER_COL2').length})`
                : loc === 'FOOTER_COL3'
                ? `Footer Cột 3 (${menus.filter((m) => m.location === 'FOOTER_COL3').length})`
                : `Mobile (${menus.filter((m) => m.location === 'MOBILE').length})`}
            </button>
          ),
        )}
      </div>

      {/* Menu List — Drag & Drop */}
      {filteredMenus.length > 0 ? (
        <div className="space-y-3">
          {filteredMenus.map((menu, index) => (
            <MenuItemRow
              key={menu.id}
              menu={menu}
              index={index}
              isFirst={index === 0}
              isLast={index === filteredMenus.length - 1}
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
          <Menu className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Chưa có Menu item nào cho khu vực này
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Bấm vào nút &quot;Thêm Menu Mới&quot; ở trên để khởi tạo liên kết menu đầu tiên.
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
