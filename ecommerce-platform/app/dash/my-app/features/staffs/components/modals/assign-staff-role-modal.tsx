'use client';
import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { StaffListItem, StaffRole, UpdateStaffRoleInput } from '@/features/staffs/types/staff.types';

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
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (staff) {
      setRole(staff.role);
      setPermissions(['order.view', 'product.view']);
    }
  }, [staff, isOpen]);

  if (!isOpen || !staff) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      staffId: staff.id,
      role,
      permissions: role === 'STAFF' ? permissions : undefined,
    });
    onClose();
  };

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const permissionList = [
    { id: 'order.view', label: 'Quản lý Đơn hàng', desc: 'Xem, cập nhật trạng thái đơn hàng' },
    { id: 'product.view', label: 'Quản lý Sản phẩm', desc: 'Thêm, sửa, xóa sản phẩm & danh mục' },
    { id: 'customer.view', label: 'Quản lý Khách hàng', desc: 'Xem danh sách, khóa tài khoản KH' },
    { id: 'banner.manage', label: 'Thiết lập hệ thống', desc: 'Chỉnh sửa banner, thông tin cửa hàng' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
        <div className="flex flex-shrink-0 items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Phân quyền tài khoản</h2>
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
              <p className="text-xs text-slate-400 mt-0.5">{staff.email}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Cấp độ truy cập
              </label>
              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all ${
                    role === 'ADMIN'
                      ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/20'
                      : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-1"
                    checked={role === 'ADMIN'}
                    onChange={() => setRole('ADMIN')}
                  />
                  <div>
                    <p className={`text-sm font-bold ${role === 'ADMIN' ? 'text-[#2563EB]' : 'text-slate-700 dark:text-slate-300'}`}>
                      Quản trị viên (ADMIN)
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Toàn quyền truy cập tất cả các tính năng và thiết lập hệ thống.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all ${
                    role === 'STAFF'
                      ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/20'
                      : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-1"
                    checked={role === 'STAFF'}
                    onChange={() => setRole('STAFF')}
                  />
                  <div>
                    <p className={`text-sm font-bold ${role === 'STAFF' ? 'text-[#2563EB]' : 'text-slate-700 dark:text-slate-300'}`}>
                      Nhân viên (STAFF)
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Quyền truy cập hạn chế theo từng module chức năng được cấp.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {role === 'STAFF' && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Phân quyền chức năng chi tiết
                </label>
                <div className="space-y-2">
                  {permissionList.map((perm) => {
                    const isChecked = permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-3 p-3 border rounded-2xl cursor-pointer transition-all ${
                          isChecked
                            ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/20'
                            : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 flex-shrink-0 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-[#2563EB] border-[#2563EB] text-white'
                              : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.id)}
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${isChecked ? 'text-[#2563EB]' : 'text-slate-700 dark:text-slate-300'}`}>
                            {perm.label}
                          </p>
                          <p className="text-xs text-slate-500">{perm.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
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
