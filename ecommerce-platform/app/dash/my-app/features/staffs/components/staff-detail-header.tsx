import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StaffDetail } from '@/features/staffs/types/staff.types';
import EditStaffProfileButton from './edit-staff-profile-button';
import ToggleStaffStatusButton from './toggle-staff-status-button';
import StaffRoleBadge from './staff-role-badge';

interface StaffDetailHeaderProps {
  staff: StaffDetail;
  onEditClick: () => void;
  onToggleStatusClick: () => void;
}

export default function StaffDetailHeader({ staff, onEditClick, onToggleStatusClick }: StaffDetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-4">
        <Link
          href="/staffs"
          className="p-2 -ml-2 mt-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {staff.fullName}
            </h1>
            <StaffRoleBadge role={staff.role} label={staff.roleLabel} />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Mã nhân viên: <span className="font-semibold">#{staff.numericId}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <EditStaffProfileButton onClick={onEditClick} />
        <ToggleStaffStatusButton status={staff.status} onClick={onToggleStatusClick} />
      </div>
    </div>
  );
}
