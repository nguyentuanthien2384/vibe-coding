'use client';
import React from 'react';
import { Power } from 'lucide-react';
import { StaffStatus } from '@/features/staffs/types/staff.types';

interface ToggleStaffStatusButtonProps {
  status: StaffStatus;
  onClick: () => void;
}

export default function ToggleStaffStatusButton({ status, onClick }: ToggleStaffStatusButtonProps) {
  const isLocked = status === 'BLOCKED';
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-2xl transition-colors shadow-sm ${
        isLocked
          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800'
          : 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800'
      }`}
    >
      <Power className="w-4 h-4" />
      <span>{isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</span>
    </button>
  );
}
