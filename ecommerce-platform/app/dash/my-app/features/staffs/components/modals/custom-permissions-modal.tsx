'use client';
import React, { useState, useEffect } from 'react';
import { X, Info, Check, Shield } from 'lucide-react';
import { StaffListItem, UpdateStaffCustomPermissionsInput, PermissionDefinition } from '@/features/staffs/types/staff.types';
import { PERMISSION_GROUPS } from '@/features/staffs/data/mock-staffs';

interface CustomPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffListItem | null;
  onSubmit: (data: UpdateStaffCustomPermissionsInput) => void;
}

export default function CustomPermissionsModal({
  isOpen,
  onClose,
  staff,
  onSubmit,
}: CustomPermissionsModalProps) {
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (staff) {
      setCustomPermissions(staff.customPermissions || []);
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const inheritedSet = new Set(staff.inheritedPermissions || []);

  const handleToggleCustom = (permId: string) => {
    if (inheritedSet.has(permId)) return; // Không thể toggle quyền đã kế thừa từ nhóm

    setCustomPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      staffId: staff.id,
      customPermissions,
    });
    onClose();
  };

  // Tách 4 nhóm thành 2 cột: Cột trái (PRODUCT, CUSTOMER), Cột phải (ORDER, SYSTEM)
  const leftGroups = PERMISSION_GROUPS.filter((g) => g.category === 'PRODUCT' || g.category === 'CUSTOMER');
  const rightGroups = PERMISSION_GROUPS.filter((g) => g.category === 'ORDER' || g.category === 'SYSTEM');

  const initials = staff.fullName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Thiết lập đặc quyền bổ sung</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* User Info & Notice Banner */}
          <div className="bg-[#F8FAFC] dark:bg-slate-800/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-base shadow-sm">
                {initials}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{staff.fullName}</h3>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-300">
                  Nhóm: {staff.roleGroupName || 'Chưa gán nhóm'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60 max-w-md text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <Info className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
              <p>
                Các quyền <span className="text-[#059669] font-semibold">màu xanh</span> là quyền kế thừa từ Nhóm. Bạn chỉ có thể cấp thêm các quyền chưa có cho nhân viên này.
              </p>
            </div>
          </div>

          {/* 2-Column Permissions Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1: SẢN PHẨM & CHUYÊN MỤC, NGƯỜI DÙNG & KHÁCH HÀNG */}
            <div className="space-y-6">
              {leftGroups.map((group) => (
                <div key={group.category} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>{group.title}</span>
                  </div>

                  <div className="space-y-2.5">
                    {group.permissions.map((perm: PermissionDefinition) => {
                      const isInherited = inheritedSet.has(perm.id);
                      const isCustomChecked = customPermissions.includes(perm.id);

                      if (isInherited) {
                        return (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] dark:bg-emerald-950/20 dark:border-emerald-800/40 cursor-not-allowed select-none"
                          >
                            <div>
                              <p className="text-sm font-semibold text-[#047857] dark:text-emerald-400">
                                {perm.label}
                              </p>
                              <span className="inline-block mt-0.5 text-[10px] font-bold tracking-wider text-[#059669] dark:text-emerald-500 uppercase">
                                ĐÃ CÓ TRONG NHÓM
                              </span>
                            </div>
                            <div className="w-5 h-5 rounded-md bg-[#10B981] flex items-center justify-center text-white">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleToggleCustom(perm.id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isCustomChecked
                              ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/20 dark:border-blue-800'
                              : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                isCustomChecked
                                  ? 'text-[#1D4ED8] dark:text-blue-300 font-semibold'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {perm.label}
                            </p>
                            {isCustomChecked && (
                              <span className="inline-block mt-0.5 text-[10px] font-bold tracking-wider text-[#2563EB] uppercase">
                                ĐẶC QUYỀN BỔ SUNG
                              </span>
                            )}
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isCustomChecked
                                ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                            }`}
                          >
                            {isCustomChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: ĐƠN HÀNG & THANH TOÁN, CẤU HÌNH HỆ THỐNG */}
            <div className="space-y-6">
              {rightGroups.map((group) => (
                <div key={group.category} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>{group.title}</span>
                  </div>

                  <div className="space-y-2.5">
                    {group.permissions.map((perm: PermissionDefinition) => {
                      const isInherited = inheritedSet.has(perm.id);
                      const isCustomChecked = customPermissions.includes(perm.id);

                      if (isInherited) {
                        return (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] dark:bg-emerald-950/20 dark:border-emerald-800/40 cursor-not-allowed select-none"
                          >
                            <div>
                              <p className="text-sm font-semibold text-[#047857] dark:text-emerald-400">
                                {perm.label}
                              </p>
                              <span className="inline-block mt-0.5 text-[10px] font-bold tracking-wider text-[#059669] dark:text-emerald-500 uppercase">
                                ĐÃ CÓ TRONG NHÓM
                              </span>
                            </div>
                            <div className="w-5 h-5 rounded-md bg-[#10B981] flex items-center justify-center text-white">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleToggleCustom(perm.id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isCustomChecked
                              ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/20 dark:border-blue-800'
                              : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                isCustomChecked
                                  ? 'text-[#1D4ED8] dark:text-blue-300 font-semibold'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {perm.label}
                            </p>
                            {isCustomChecked && (
                              <span className="inline-block mt-0.5 text-[10px] font-bold tracking-wider text-[#2563EB] uppercase">
                                ĐẶC QUYỀN BỔ SUNG
                              </span>
                            )}
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isCustomChecked
                                ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                            }`}
                          >
                            {isCustomChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-[#F1F5F9] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-sm"
          >
            Lưu đặc quyền
          </button>
        </div>
      </div>
    </div>
  );
}
