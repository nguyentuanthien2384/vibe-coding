import React from 'react';
import { StaffRole } from '@/features/staffs/types/staff.types';

interface StaffRoleBadgeProps {
  role: StaffRole;
  label?: string;
}

export default function StaffRoleBadge({ role, label }: StaffRoleBadgeProps) {
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400">
        {label || 'Quản trị viên'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/40 dark:text-blue-400">
      {label || 'Nhân viên'}
    </span>
  );
}
