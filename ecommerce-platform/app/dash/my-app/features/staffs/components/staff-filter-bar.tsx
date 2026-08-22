'use client';
import React from 'react';
import { Search, Filter, Shield } from 'lucide-react';
import { StaffRole, StaffStatus } from '@/features/staffs/types/staff.types';

interface StaffFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRole: StaffRole | 'ALL';
  onRoleChange: (role: StaffRole | 'ALL') => void;
  selectedStatus: StaffStatus | 'ALL';
  onStatusChange: (status: StaffStatus | 'ALL') => void;
  totalCount: number;
}

export default function StaffFilterBar({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  totalCount,
}: StaffFilterBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm tên, email, số điện thoại..."
            className="w-full h-11 pl-11 pr-4 bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
          />
        </div>

        {/* Filter Status */}
        <div className="relative">
          <div className="flex items-center gap-2 h-11 px-4 bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-sm text-slate-700 dark:text-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value as StaffStatus | 'ALL')}
              className="bg-transparent text-sm focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="BLOCKED">Bị khóa</option>
            </select>
          </div>
        </div>

        {/* Filter Role */}
        <div className="relative">
          <div className="flex items-center gap-2 h-11 px-4 bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-sm text-slate-700 dark:text-slate-200">
            <Shield className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value as StaffRole | 'ALL')}
              className="bg-transparent text-sm focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="STAFF">Nhân viên</option>
            </select>
          </div>
        </div>
      </div>

      {/* Count Indicator */}
      <div className="text-sm text-slate-400 font-medium px-2 self-center">
        {totalCount} nhân viên
      </div>
    </div>
  );
}
