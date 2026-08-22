'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CreateStaffInput, StaffRole, StaffRoleGroup } from '@/features/staffs/types/staff.types';
import { getRoleGroups } from '@/features/staffs/api/staffs-api';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffInput) => void;
}

export default function CreateStaffModal({ isOpen, onClose, onSubmit }: CreateStaffModalProps) {
  const [formData, setFormData] = useState<CreateStaffInput>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'STAFF',
    roleGroupId: null,
    notes: '',
  });

  const [roleGroups, setRoleGroups] = useState<StaffRoleGroup[]>([]);

  useEffect(() => {
    if (isOpen) {
      getRoleGroups()
        .then((res) => {
          setRoleGroups(res.roleGroups.filter((g) => !g.isSystem));
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      roleGroupId: formData.role === 'STAFF' ? (formData.roleGroupId ? Number(formData.roleGroupId) : null) : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Thêm nhân viên mới</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full h-11 px-4 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              placeholder="VD: Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-11 px-4 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              placeholder="staff@techbite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-11 px-4 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              placeholder="0901234567"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mật khẩu <span className="text-slate-400 font-normal">(Mặc định: Password123)</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-11 px-4 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              placeholder="Để trống để dùng mật khẩu mặc định"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
              className="w-full h-11 px-4 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
            >
              <option value="STAFF">Nhân viên (STAFF)</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
            </select>
          </div>

          {formData.role === 'STAFF' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nhóm quyền chức danh
              </label>
              <select
                value={formData.roleGroupId ? String(formData.roleGroupId) : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roleGroupId: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full h-11 px-4 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              >
                <option value="">-- Chưa gán nhóm --</option>
                {roleGroups.map((g) => (
                  <option key={g.id} value={String(g.id)}>
                    {g.name} ({g.permissions.length} quyền)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ghi chú nội bộ
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full p-3.5 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-slate-900 dark:text-white"
              placeholder="Ghi chú thêm về nhân sự..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-sm"
            >
              Tạo nhân viên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
