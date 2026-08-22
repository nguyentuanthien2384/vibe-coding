import React from 'react';
import Link from 'next/link';
import { Shield, UserPlus } from 'lucide-react';

interface StaffListPageHeaderProps {
  onCreateClick: () => void;
}

export default function StaffListPageHeader({ onCreateClick }: StaffListPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý nhân viên</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý đội ngũ vận hành và phân quyền truy cập hệ thống
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/staffs/roles"
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-2xl border border-gray-200 dark:border-slate-700 transition-colors shadow-sm"
        >
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Quản lý nhóm quyền</span>
        </Link>

        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-2xl transition-colors shadow-sm shadow-blue-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm nhân viên mới</span>
        </button>
      </div>
    </div>
  );
}
