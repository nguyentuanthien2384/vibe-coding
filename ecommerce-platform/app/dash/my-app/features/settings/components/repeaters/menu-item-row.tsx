'use client';

import { MenuSettingItem } from '../../types/settings.types';
import { ArrowUp, ArrowDown, Edit2, Trash2, Link as LinkIcon, GripVertical } from 'lucide-react';

interface MenuItemRowProps {
  menu: MenuSettingItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onToggleActive: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEdit: (menu: MenuSettingItem) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

const getLocationBadge = (loc: string) => {
  switch (loc) {
    case 'HEADER':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
    case 'FOOTER_COL1':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800';
    case 'FOOTER_COL2':
      return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800';
    case 'FOOTER_COL3':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
    case 'MOBILE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

const getLocationLabel = (loc: string) => {
  const map: Record<string, string> = {
    HEADER: 'Header Nav',
    FOOTER_COL1: 'Footer Cột 1',
    FOOTER_COL2: 'Footer Cột 2',
    FOOTER_COL3: 'Footer Cột 3',
    MOBILE: 'Mobile',
  };
  return map[loc] ?? loc;
};

const MenuItemRow = ({
  menu,
  index,
  isFirst,
  isLast,
  isDragging,
  isDragOver,
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
}: MenuItemRowProps) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`rounded-xl border p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'opacity-40 scale-95 border-dashed border-[#4880FF] bg-blue-50/50 dark:bg-blue-950/20'
          : isDragOver
          ? 'border-[#4880FF] bg-blue-50/30 dark:bg-blue-950/20 shadow-md shadow-blue-500/10 scale-[1.01]'
          : 'bg-gray-50/60 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
      }`}
    >
      {/* Left: Drag handle + Menu Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Drag Handle */}
        <div className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 flex-shrink-0 p-1">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Order badge */}
        <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-[#4880FF] flex-shrink-0 font-bold text-xs">
          #{menu.order}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLocationBadge(menu.location)}`}
            >
              {getLocationLabel(menu.location)}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              {menu.icon && (
                <span className="text-slate-400 text-xs font-mono">[{menu.icon}]</span>
              )}
              {menu.title}
              {menu.openInNewTab && (
                <span className="text-[10px] px-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                  _blank
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{menu.targetUrl}</span>
          </div>
          {menu.children && menu.children.length > 0 && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {menu.children.length} menu con
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
        {/* Order Move Up/Down */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMoveUp(menu.id)}
            title="Di chuyển lên trên"
            className="p-1 text-slate-500 hover:text-[#4880FF] disabled:opacity-30 disabled:hover:text-slate-500 rounded transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMoveDown(menu.id)}
            title="Di chuyển xuống dưới"
            className="p-1 text-slate-500 hover:text-[#4880FF] disabled:opacity-30 disabled:hover:text-slate-500 rounded transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Toggle */}
        <label className="relative inline-flex items-center cursor-pointer" title="Bật/tắt trạng thái hiển thị">
          <input
            type="checkbox"
            checked={menu.isActive}
            onChange={() => onToggleActive(menu.id)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>

        {/* Edit Button */}
        <button
          type="button"
          onClick={() => onEdit(menu)}
          title="Chỉnh sửa Menu"
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#4880FF] dark:hover:text-[#4880FF] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(menu.id)}
          title="Xóa Menu"
          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MenuItemRow;
