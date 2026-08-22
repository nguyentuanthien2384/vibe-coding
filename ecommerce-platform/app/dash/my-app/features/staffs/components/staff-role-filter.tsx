'use client';
import React from 'react';
import { StaffRole } from '@/features/staffs/types/staff.types';

interface StaffRoleFilterProps {
  selected: StaffRole | 'ALL';
  onChange: (role: StaffRole | 'ALL') => void;
}

export default function StaffRoleFilter({ selected, onChange }: StaffRoleFilterProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value as StaffRole | 'ALL')}
      className="h-11 px-3 bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      <option value="ALL">Tất cả vai trò</option>
      <option value="ADMIN">Quản trị viên</option>
      <option value="STAFF">Nhân viên</option>
    </select>
  );
}
