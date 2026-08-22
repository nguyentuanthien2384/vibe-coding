'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, Shield, MoreHorizontal, ArrowRight, Power, UserCog } from 'lucide-react';
import { StaffListItem } from '@/features/staffs/types/staff.types';
import StaffStatusBadge from './staff-status-badge';
import StaffRoleBadge from './staff-role-badge';

interface StaffTableRowProps {
  staff: StaffListItem;
  onOpenCustomPermissions: (staff: StaffListItem) => void;
  onToggleStatus: (staff: StaffListItem) => void;
}

const AVATAR_COLORS: Record<number, string> = {
  1: 'bg-[#15803D]', // Xanh lá đậm NA
  2: 'bg-[#1D4ED8]', // Xanh dương TB
  3: 'bg-[#831843]', // Đỏ tím mận LC
  4: 'bg-[#E11D48]', // Đỏ san hô PD
};

export default function StaffTableRow({
  staff,
  onOpenCustomPermissions,
  onToggleStatus,
}: StaffTableRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const initials = staff.fullName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const avatarBg = AVATAR_COLORS[staff.numericId] || 'bg-blue-600';

  return (
    <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors border-b border-gray-100 dark:border-slate-800/80 last:border-0">
      {/* CỘT 1: NHÂN VIÊN */}
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center gap-3.5">
          <div className={`relative w-11 h-11 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0`}>
            {initials}
            {staff.status === 'ACTIVE' && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            )}
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              {staff.fullName}
            </span>
            <span className="text-xs text-slate-400 font-medium block mt-0.5">
              ID: #{staff.numericId}
            </span>
          </div>
        </div>
      </td>

      {/* CỘT 2: LIÊN HỆ */}
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{staff.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{staff.phone || 'Chưa có SĐT'}</span>
          </div>
        </div>
      </td>

      {/* CỘT 3: VAI TRÒ */}
      <td className="px-6 py-5 whitespace-nowrap">
        <StaffRoleBadge role={staff.role} label={staff.roleLabel} />
      </td>

      {/* CỘT 4: TRẠNG THÁI */}
      <td className="px-6 py-5 whitespace-nowrap">
        <StaffStatusBadge status={staff.status} />
      </td>

      {/* CỘT 5: NGÀY THAM GIA */}
      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
        {staff.createdAt}
      </td>

      {/* CỘT 6: THAO TÁC */}
      <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
        <div className="flex items-center justify-end gap-3">
          {/* Link Chi tiết */}
          <Link
            href={`/staffs/${staff.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>Chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Nút icon Shield: Mở Modal Thiết lập đặc quyền bổ sung */}
          <button
            type="button"
            onClick={() => onOpenCustomPermissions(staff)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
            title="Thiết lập đặc quyền bổ sung"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Menu ba chấm */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenCustomPermissions(staff);
                    }}
                    className="w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <UserCog className="w-4 h-4 text-blue-600" />
                    <span>Phân quyền chi tiết</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleStatus(staff);
                    }}
                    className="w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <Power className="w-4 h-4" />
                    <span>{staff.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
