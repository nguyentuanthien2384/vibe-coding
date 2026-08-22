'use client';
import React from 'react';
import { Pencil } from 'lucide-react';

interface EditStaffProfileButtonProps {
  onClick: () => void;
}

export default function EditStaffProfileButton({ onClick }: EditStaffProfileButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 text-sm font-semibold rounded-xl transition-colors shadow-sm"
    >
      <Pencil className="w-4 h-4" />
      <span>Chỉnh sửa</span>
    </button>
  );
}
