'use client';

import { Users, UserCheck, UserX, Plus } from 'lucide-react';

interface CustomerListPageHeaderProps {
  stats: {
    totalCustomers: number;
    registeredCount: number;
    guestCount: number;
    activeCount: number;
    blockedCount: number;
  };
  onCreateClick: () => void;
}

const CustomerListPageHeader = ({ stats, onCreateClick }: CustomerListPageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
          <Users className="w-7 h-7 text-[#4880FF]" />
          Quản Lý Khách Hàng
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi danh sách khách hàng thành viên, khách vãng lai và quản lý thông tin tài khoản.
        </p>

        {/* Quick Stat Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
            Tổng số: <strong className="ml-1 text-slate-900 dark:text-white">{stats.totalCustomers}</strong>
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800">
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            Thành viên: <strong className="ml-1">{stats.registeredCount}</strong>
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800">
            <UserX className="w-3.5 h-3.5 mr-1" />
            Vãng lai: <strong className="ml-1">{stats.guestCount}</strong>
          </span>
        </div>
      </div>

      <button
        onClick={onCreateClick}
        className="inline-flex items-center justify-center px-4 py-2.5 bg-[#4880FF] hover:bg-[#3b6edc] text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex-shrink-0 active:scale-95"
      >
        <Plus className="w-4 h-4 mr-2" />
        Tạo Khách Hàng Thủ Công
      </button>
    </div>
  );
};

export default CustomerListPageHeader;
