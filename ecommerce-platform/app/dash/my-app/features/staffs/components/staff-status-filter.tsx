'use client';
import React from 'react';
import { StaffStatus } from '@/features/staffs/types/staff.types';

interface StaffStatusFilterProps {
  selected: StaffStatus | 'ALL';
  onChange: (status: StaffStatus | 'ALL') => void;
}

export default function StaffStatusFilter({ selected, onChange }: StaffStatusFilterProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value as StaffStatus | 'ALL')}
      className="h-11 px-3 bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      <option value="ALL">Tất cả trạng thái</option>
      <option value="ACTIVE">Hoạt động</option>
      <option value="BLOCKED">Bị khóa</option>
    </select>
  );
}
