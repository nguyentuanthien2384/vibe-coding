import React from 'react';
import { StaffStatus } from '@/features/staffs/types/staff.types';

interface StaffStatusBadgeProps {
  status: StaffStatus;
}

export default function StaffStatusBadge({ status }: StaffStatusBadgeProps) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-400">
        Hoạt động
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400">
      Bị khóa
    </span>
  );
}
