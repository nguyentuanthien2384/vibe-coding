'use client';
import React from 'react';
import { ShieldCheck, UserCog, CheckCircle2, PlusCircle, Shield } from 'lucide-react';
import { StaffDetail, PermissionDefinition } from '@/features/staffs/types/staff.types';
import { ALL_PERMISSIONS } from '@/features/staffs/data/mock-staffs';

interface StaffRolePermissionsCardProps {
  staff: StaffDetail;
  onEditRoleClick: () => void;
}

export default function StaffRolePermissionsCard({
  staff,
  onEditRoleClick,
}: StaffRolePermissionsCardProps) {
  const isAdmin = staff.role === 'ADMIN';
  const inheritedSet = new Set(staff.inheritedPermissions || []);
  const customSet = new Set(staff.customPermissions || []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Nhóm quyền & Đặc quyền bổ sung
          </h3>
        </div>
        <button
          onClick={onEditRoleClick}
          className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-xl transition-colors"
        >
          Thiết lập đặc quyền
        </button>
      </div>

      {/* Role Banner */}
      <div
        className={`flex items-start gap-4 p-4 rounded-2xl border ${
          isAdmin
            ? 'bg-amber-50/60 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/30'
            : 'bg-blue-50/60 border-blue-200/60 dark:bg-blue-950/20 dark:border-blue-900/30'
        } mb-6`}
      >
        <div
          className={`p-3 rounded-2xl ${
            isAdmin
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40'
              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40'
          }`}
        >
          {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <UserCog className="w-6 h-6" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4
              className={`text-base font-bold ${
                isAdmin
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-blue-700 dark:text-blue-400'
              }`}
            >
              {staff.roleLabel}
            </h4>
            <span className="text-xs font-medium text-slate-500">
              (Nhóm: {staff.roleGroupName || 'Chưa gán nhóm'})
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {isAdmin
              ? 'Toàn quyền quản trị hệ thống. Có thể cấu hình và duyệt tất cả các module.'
              : 'Quyền hạn được kế thừa theo nhóm chức danh và các đặc quyền cấp riêng lẻ.'}
          </p>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="flex-1">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Chi tiết quyền hạn được kích hoạt
        </h5>

        {isAdmin ? (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Tài khoản Quản trị viên được mở khóa toàn bộ quyền hạn hệ thống.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_PERMISSIONS.map((perm: PermissionDefinition) => {
              const isInherited = inheritedSet.has(perm.id);
              const isCustom = customSet.has(perm.id);
              const hasPerm = isInherited || isCustom;

              return (
                <div
                  key={perm.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isInherited
                      ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40'
                      : isCustom
                      ? 'bg-blue-50/60 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/40'
                      : 'bg-slate-50/40 border-slate-100 dark:bg-slate-800/20 dark:border-slate-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isInherited && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                    {isCustom && (
                      <PlusCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                    {!hasPerm && (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        isInherited
                          ? 'text-emerald-800 dark:text-emerald-300 font-semibold'
                          : isCustom
                          ? 'text-blue-800 dark:text-blue-300 font-semibold'
                          : 'text-slate-400 line-through'
                      }`}
                    >
                      {perm.label}
                    </span>
                  </div>

                  {isInherited && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-md uppercase">
                      Nhóm
                    </span>
                  )}
                  {isCustom && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md uppercase">
                      Bổ sung
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
