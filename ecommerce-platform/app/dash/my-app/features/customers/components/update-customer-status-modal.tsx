'use client';

import { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import { CustomerListItem, CustomerStatus, UpdateCustomerStatusInput } from '../types/customer.types';

interface UpdateCustomerStatusModalProps {
  customer: CustomerListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: UpdateCustomerStatusInput) => Promise<void>;
}

const UpdateCustomerStatusModal = ({
  customer,
  isOpen,
  onClose,
  onSubmit,
}: UpdateCustomerStatusModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus>(customer?.status || 'ACTIVE');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmit({
        customerId: customer.id,
        status: selectedStatus,
        reason: reason.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Cập nhật thất bại, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Cập Nhật Trạng Thái Khách Hàng
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {errorMsg}
          </div>
        )}

        <div className="mt-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
          <div className="font-semibold text-slate-800 dark:text-white text-sm">
            {customer.fullName}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{customer.email} • {customer.phone}</div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Chọn Trạng Thái Mới
            </label>

            <div className="space-y-2">
              {/* ACTIVE */}
              <label
                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'ACTIVE'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="ACTIVE"
                  checked={selectedStatus === 'ACTIVE'}
                  onChange={() => setSelectedStatus('ACTIVE')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-xs text-slate-800 dark:text-white">Hoạt Động (Active)</div>
                    <div className="text-[11px] text-slate-500">Khách hàng được phép đăng nhập và đặt hàng bình thường</div>
                  </div>
                </div>
              </label>

              {/* BLOCKED */}
              <label
                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'BLOCKED'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="BLOCKED"
                  checked={selectedStatus === 'BLOCKED'}
                  onChange={() => setSelectedStatus('BLOCKED')}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                />
                <div className="ml-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-semibold text-xs text-slate-800 dark:text-white">Tạm Khóa (Blocked)</div>
                    <div className="text-[11px] text-slate-500">Khóa tài khoản, không cho phép đăng nhập hay tạo đơn</div>
                  </div>
                </div>
              </label>

              {/* INACTIVE */}
              <label
                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'INACTIVE'
                    ? 'border-slate-500 bg-slate-100/50 dark:bg-slate-800/60'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="INACTIVE"
                  checked={selectedStatus === 'INACTIVE'}
                  onChange={() => setSelectedStatus('INACTIVE')}
                  className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                />
                <div className="ml-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-semibold text-xs text-slate-800 dark:text-white">Ngưng Hoạt Động (Inactive)</div>
                    <div className="text-[11px] text-slate-500">Tài khoản chưa xác thực hoặc ngưng hoạt động lâu dài</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lý do cập nhật (Ghi chú nội bộ)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Bom hàng 3 lần liên tiếp / Yêu cầu mở lại tài khoản..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCustomerStatusModal;
