'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { X, ShieldCheck, UserCog, Check, Users } from 'lucide-react';
import { StaffListItem, StaffRole, StaffRoleGroup, UpdateStaffRoleInput } from '@/features/staffs/types/staff.types';
import { getRoleGroups } from '@/features/staffs/api/staffs-api';

interface AssignStaffRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffListItem | null;
  onSubmit: (data: UpdateStaffRoleInput) => void;
}

export default function AssignStaffRoleModal({
  isOpen,
  onClose,
  staff,
  onSubmit,
}: AssignStaffRoleModalProps) {
  const [role, setRole] = useState<StaffRole>('STAFF');
  const [roleGroupId, setRoleGroupId] = useState<number | null>(null);
  const [roleGroups, setRoleGroups] = useState<StaffRoleGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const fetchGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    try {
      const res = await getRoleGroups();
      setRoleGroups(res.roleGroups);
    } catch {
      // Fallback
    } finally {
      setIsLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen, fetchGroups]);

  useEffect(() => {
    if (staff) {
      setRole(staff.role);
      const parsedGroupId = typeof staff.roleGroupId === 'number'
        ? staff.roleGroupId
        : staff.roleGroupId ? parseInt(String(staff.roleGroupId), 10) : null;
      setRoleGroupId(isNaN(parsedGroupId as number) ? null : parsedGroupId);
    }
  }, [staff, isOpen]);

  if (!isOpen || !staff) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      staffId: staff.id,
      role,
      roleGroupId: role === 'STAFF' ? roleGroupId : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
        <div className="flex flex-shrink-0 items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Phân quyền & Nhóm vai trò</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="assign-role-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Nhân viên: <span className="text-[#2563EB]">{staff.fullName}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{staff.email} • #{staff.numericId}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Cấp độ vai trò chính
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setRole('ADMIN')}
                  className={`flex items-start gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all ${
                    role === 'ADMIN'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800'
                      : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${role === 'ADMIN' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${role === 'ADMIN' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      Quản trị viên (ADMIN)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Toàn quyền quản trị tất cả module.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setRole('STAFF')}
                  className={`flex items-start gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all ${
                    role === 'STAFF'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800'
                      : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${role === 'STAFF' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <UserCog className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${role === 'STAFF' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      Nhân viên (STAFF)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Phân quyền theo nhóm chức danh.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {role === 'STAFF' && (
              <div className="animate-in slide-in-from-top-2 space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Gán vào nhóm quyền chức danh
                </label>

                {isLoadingGroups ? (
                  <div className="p-6 text-center text-xs text-slate-400">Đang tải danh sách nhóm quyền...</div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Option: Chưa gán nhóm */}
                    <div
                      onClick={() => setRoleGroupId(null)}
                      className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all ${
                        roleGroupId === null
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm'
                          : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Chưa gán nhóm
                        </p>
                        <p className="text-xs text-slate-400">Chỉ có quyền cơ bản hoặc đặc quyền cấp riêng</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        roleGroupId === null ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {roleGroupId === null && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Danh sách Role Groups từ DB */}
                    {roleGroups
                      .filter((g) => !g.isSystem)
                      .map((group) => {
                        const numId = typeof group.id === 'number' ? group.id : parseInt(String(group.id), 10);
                        const isSelected = roleGroupId === numId;

                        return (
                          <div
                            key={group.id}
                            onClick={() => setRoleGroupId(numId)}
                            className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm'
                                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex-1 pr-3">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  {group.name}
                                </p>
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                  <Users className="w-3 h-3" />
                                  {group.memberCount} thành viên
                                </span>
                              </div>
                              {group.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{group.description}</p>
                              )}
                              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                                {group.permissions.length} quyền kích hoạt
                              </p>
                            </div>

                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="flex flex-shrink-0 justify-end gap-3 p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="assign-role-form"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-sm"
          >
            Lưu phân quyền
          </button>
        </div>
      </div>
    </div>
  );
}
