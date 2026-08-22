'use client';
import React, { useState, useEffect } from 'react';
import { X, Shield, Check } from 'lucide-react';
import { StaffRoleGroup, CreateRoleGroupInput, UpdateRoleGroupInput, PermissionDefinition } from '@/features/staffs/types/staff.types';
import { PERMISSION_GROUPS } from '@/features/staffs/data/mock-staffs';

interface RoleGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleGroup: StaffRoleGroup | null;
  onSubmit: (data: CreateRoleGroupInput | UpdateRoleGroupInput) => void;
}

export default function RoleGroupModal({
  isOpen,
  onClose,
  roleGroup,
  onSubmit,
}: RoleGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (roleGroup) {
      setName(roleGroup.name);
      setDescription(roleGroup.description || '');
      setPermissions(roleGroup.permissions || []);
    } else {

      setName('');
      setDescription('');
      setPermissions([]);
    }
  }, [roleGroup, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!roleGroup;

  const togglePermission = (permId: string) => {
    setPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const toggleCategory = (permIds: string[]) => {
    const allChecked = permIds.every((id) => permissions.includes(id));
    if (allChecked) {
      setPermissions((prev) => prev.filter((id) => !permIds.includes(id)));
    } else {
      setPermissions((prev) => Array.from(new Set([...prev, ...permIds])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      onSubmit({
        id: roleGroup.id,
        name,
        description,
        permissions,
      });
    } else {
      onSubmit({
        name,
        description,
        permissions,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEditing ? 'Chỉnh sửa nhóm quyền' : 'Tạo nhóm quyền mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form id="role-group-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Tên nhóm quyền */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tên nhóm quyền <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Cửa hàng trưởng, Nhân viên kho, Kế toán..."
                className="w-full h-11 px-4 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mô tả chức danh & nhiệm vụ
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Mô tả quyền hạn và trách nhiệm của nhóm quyền này..."
                className="w-full p-4 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Checklist Quyền hạn */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Cấu hình quyền hạn trong nhóm
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PERMISSION_GROUPS.map((group) => {
                  const permIds = group.permissions.map((p: PermissionDefinition) => p.id);
                  const isAllChecked = permIds.every((id: string) => permissions.includes(id));

                  return (
                    <div
                      key={group.category}
                      className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                          <span>{group.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCategory(permIds)}
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {isAllChecked ? 'Bỏ chọn' : 'Chọn tất cả'}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {group.permissions.map((perm: PermissionDefinition) => {
                          const isChecked = permissions.includes(perm.id);
                          return (
                            <div
                              key={perm.id}
                              onClick={() => togglePermission(perm.id)}
                              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-sm'
                                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                              }`}
                            >
                              <span className={`text-xs font-medium ${isChecked ? 'text-blue-600 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                                {perm.label}
                              </span>
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  isChecked
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-[#F1F5F9] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="role-group-form"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-sm"
          >
            {isEditing ? 'Lưu thay đổi' : 'Tạo nhóm quyền'}
          </button>
        </div>
      </div>
    </div>
  );
}
