'use client';
import React, { useState, useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { StaffListItem, StaffStatus, UpdateStaffStatusInput } from '@/features/staffs/types/staff.types';

interface UpdateStaffStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffListItem | null;
  onSubmit: (data: UpdateStaffStatusInput) => void;
}

export default function UpdateStaffStatusModal({
  isOpen,
  onClose,
  staff,
  onSubmit,
}: UpdateStaffStatusModalProps) {
  const [status, setStatus] = useState<StaffStatus>('ACTIVE');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (staff) {
      setStatus(staff.status);
      setReason('');
    }
  }, [staff, isOpen]);

  if (!isOpen || !staff) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      staffId: staff.id,
      status,
      reason: status === 'BLOCKED' ? reason : undefined,
    });
    onClose();
  };

  const isLocking = status === 'BLOCKED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cập nhật trạng thái</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-[#F8FAFC] dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
            <div className="flex-1">
              <p className="text-xs text-slate-400">Tài khoản</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{staff.fullName}</p>
              <p className="text-xs text-slate-500">{staff.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Trạng thái tài khoản
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${
                  status === 'ACTIVE'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium'
                }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  checked={status === 'ACTIVE'}
                  onChange={() => setStatus('ACTIVE')}
                />
                <span className="text-sm">Hoạt động</span>
              </label>

              <label
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${
                  status === 'BLOCKED'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold'
                    : 'border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium'
                }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  checked={status === 'BLOCKED'}
                  onChange={() => setStatus('BLOCKED')}
                />
                <span className="text-sm">Khóa tài khoản</span>
              </label>
            </div>
          </div>

          {isLocking && (
            <div className="animate-in slide-in-from-top-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Lý do khóa tài khoản <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full p-3.5 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                placeholder="Nhập lý do để lưu vết hệ thống..."
              />
              <p className="flex items-center gap-1.5 mt-2 text-xs text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Phiên đăng nhập của tài khoản sẽ bị hủy lập tức.</span>
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm ${
                isLocking
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
              }`}
            >
              Xác nhận cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
