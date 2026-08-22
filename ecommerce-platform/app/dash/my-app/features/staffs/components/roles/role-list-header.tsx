import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

interface RoleListHeaderProps {
  onCreateClick: () => void;
}

export default function RoleListHeader({ onCreateClick }: RoleListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-start gap-3.5">
        <Link
          href="/staffs"
          className="p-2 -ml-2 mt-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nhóm quyền (Roles)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Định nghĩa các chức danh và bộ quyền hạn tương ứng
          </p>
        </div>
      </div>

      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-2xl transition-colors shadow-sm shadow-blue-500/20"
      >
        <Plus className="w-4 h-4" />
        <span>Tạo nhóm quyền mới</span>
      </button>
    </div>
  );
}
