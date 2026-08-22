'use client';
import React, { useState, useEffect } from 'react';
import { X, User, Phone, FileText } from 'lucide-react';
import { StaffDetail, UpdateStaffBasicInfoInput } from '@/features/staffs/types/staff.types';

interface EditStaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffDetail | null;
  onSubmit: (data: UpdateStaffBasicInfoInput) => void;
}

export default function EditStaffProfileModal({
  isOpen,
  onClose,
  staff,
  onSubmit,
}: EditStaffProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (staff) {
      setFullName(staff.fullName || '');
      setPhone(staff.phone || '');
      setNotes(staff.notes || '');
    }
  }, [staff, isOpen]);

  if (!isOpen || !staff) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Chỉnh sửa thông tin nhân viên
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
                placeholder="Nhập họ và tên..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
                placeholder="VD: 0901234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ghi chú nội bộ
            </label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-3.5 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-slate-900 dark:text-white"
                placeholder="Ghi chú thêm về vai trò, ca làm việc, lưu ý..."
              />
            </div>
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
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
