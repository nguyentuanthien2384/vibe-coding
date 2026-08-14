'use client';

import { useState, useEffect } from 'react';
import { X, Edit3, UserCheck, UserX } from 'lucide-react';
import { CustomerListItem, CustomerType, UpdateCustomerInfoInput } from '../types/customer.types';

interface EditCustomerModalProps {
  customer: CustomerListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: UpdateCustomerInfoInput) => Promise<void>;
}

const EditCustomerModal = ({ customer, isOpen, onClose, onSubmit }: EditCustomerModalProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<CustomerType>('REGISTERED');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (customer) {
      setFullName(customer.fullName || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setType(customer.type || 'REGISTERED');
      // @ts-ignore
      setNotes(customer.notes || '');
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmit({
        customerId: customer.id,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        type,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Cập nhật thông tin thất bại, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#4880FF]" />
            Chỉnh Sửa Thông Tin Khách Hàng
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* Mã KH */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Mã Khách Hàng:</span>
            <code className="font-mono text-xs font-bold text-slate-800 dark:text-white">{customer.id}</code>
          </div>

          {/* Họ tên */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Họ và Tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="an.nguyen@example.com"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30"
              />
            </div>

            {/* SĐT */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số Điện Thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30"
              />
            </div>
          </div>

          {/* Phân loại khách hàng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Phân Loại Khách Hàng
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('REGISTERED')}
                className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'REGISTERED'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                Khách Thành Viên
              </button>

              <button
                type="button"
                onClick={() => setType('GUEST')}
                className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'GUEST'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserX className="w-3.5 h-3.5 mr-1.5" />
                Khách Vãng Lai
              </button>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ghi Chú Quản Trị
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Khách VIP thích nhận hàng buổi chiều..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 text-xs"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-[#4880FF] hover:bg-[#3b6edc] text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Cập Nhật Thông Tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;
