'use client';
import React from 'react';
import { Plus } from 'lucide-react';

interface CreateStaffButtonProps {
  onClick: () => void;
}

export default function CreateStaffButton({ onClick }: CreateStaffButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-[#4880FF] hover:bg-[#3b6edc] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
    >
      <Plus className="w-4 h-4" />
      <span>Tạo nhân viên</span>
    </button>
  );
}
