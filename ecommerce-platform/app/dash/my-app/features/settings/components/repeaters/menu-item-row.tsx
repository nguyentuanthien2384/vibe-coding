'use client';

import { MenuSettingItem } from '../../types/settings.types';
import { ArrowUp, ArrowDown, Edit2, Trash2, ExternalLink, Link as LinkIcon, Menu } from 'lucide-react';

interface MenuItemRowProps {
  menu: MenuSettingItem;
  isFirst: boolean;
  isLast: boolean;
  onToggleActive: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEdit: (menu: MenuSettingItem) => void;
  onDelete: (id: string) => void;
}

const MenuItemRow = ({
  menu,
  isFirst,
  isLast,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: MenuItemRowProps) => {
  const getLocationBadge = (loc: string) => {
    switch (loc) {
      case 'HEADER':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 'FOOTER_COL1':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800';
      case 'FOOTER_COL2':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-gray-50/60 dark:bg-slate-800/40 rounded-xl border border-gray-200 dark:border-slate-800 p-4 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Left Menu Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-[#4880FF] flex-shrink-0 font-bold text-xs">
          #{menu.order}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLocationBadge(
                menu.location
              )}`}
            >
              {menu.location}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {menu.title}
              {menu.openInNewTab && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                  _blank
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
            {menu.targetUrl}
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
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

        {/* Active Switch */}
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
