import React from 'react';
import { StaffListItem } from '@/features/staffs/types/staff.types';
import StaffTableHeader from './staff-table-header';
import StaffTableRow from './staff-table-row';
import StaffPagination from './staff-pagination';

interface StaffTableProps {
  staffs: StaffListItem[];
  totalStaffs: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onOpenCustomPermissions: (staff: StaffListItem) => void;
  onToggleStatus: (staff: StaffListItem) => void;
}

export default function StaffTable({
  staffs,
  totalStaffs,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  isLoading = false,
  onOpenCustomPermissions,
  onToggleStatus,
}: StaffTableProps) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="w-8 h-8 border-4 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500">Đang tải danh sách nhân viên...</p>
      </div>
    );
  }

  if (staffs.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <p className="text-slate-500 font-medium">Không tìm thấy nhân viên nào phù hợp</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <StaffTableHeader />
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {staffs.map((staff) => (
              <StaffTableRow
                key={staff.id}
                staff={staff}
                onOpenCustomPermissions={onOpenCustomPermissions}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </tbody>
        </table>
      </div>

      <StaffPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalStaffs}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
