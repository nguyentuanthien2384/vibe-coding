'use client';

import { useState, useEffect } from 'react';
import { X, Edit3, ShieldAlert, ShieldCheck, FileText, User, Mail, Phone, Loader2 } from 'lucide-react';
import { CustomerListItem, CustomerStatus, UpdateCustomerInfoInput } from '../types/customer.types';
import CustomerTypeBadge from './customer-type-badge';
import { getCustomerById } from '../api/customers-api';

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
  const [status, setStatus] = useState<CustomerStatus>('ACTIVE');
  const [notes, setNotes] = useState('');

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (customer && isOpen) {
      setErrorMsg('');
      setFullName(customer.fullName.replace(/\s*\(Khách vãng lai\)$/i, '') || '');
      setEmail(customer.email === 'Chưa cung cấp' ? '' : customer.email || '');
      setPhone(customer.phone === 'Chưa cập nhật' ? '' : customer.phone || '');
      setStatus(customer.status || 'ACTIVE');
      setNotes(customer.notes || '');

      // Tải chi tiết bổ sung (đặc biệt là ghi chú nội bộ từ Redis/DB)
      let isMounted = true;
      setIsLoadingDetail(true);
      getCustomerById(customer.id)
        .then((detail) => {
          if (isMounted && detail) {
            if (detail.notes !== undefined && detail.notes !== null) {
              setNotes(detail.notes);
            }
            if (detail.status) {
              setStatus(detail.status);
            }
          }
        })
        .catch((err) => {
          console.error('Lỗi tải chi tiết khách hàng:', err);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingDetail(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const isGuest = customer.type === 'GUEST';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên khách hàng.');
      return;
    }

    if (!isGuest && (!email.trim() || !phone.trim())) {
      setErrorMsg('Khách hàng thành viên bắt buộc phải có Email và Số điện thoại hợp lệ.');
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
        status: isGuest ? 'ACTIVE' : status,
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#4880FF]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Chỉnh Sửa Nhanh Khách Hàng
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <CustomerTypeBadge type={customer.type} />
                <span className="text-[11px] text-slate-400 font-mono">#{customer.id}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3.5 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800 font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* Họ tên */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Họ và Tên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email {!isGuest && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required={!isGuest}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="an.nguyen@example.com"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 text-sm font-medium"
                />
              </div>
            </div>

            {/* SĐT */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số Điện Thoại {!isGuest && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required={!isGuest}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Trạng thái tài khoản (Chỉ dành cho Khách thành viên) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Trạng Thái Tài Khoản
            </label>
            {isGuest ? (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Khách hàng vãng lai mặc định ở trạng thái Hoạt động.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('ACTIVE')}
                  className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    status === 'ACTIVE'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Đang Hoạt Động
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('BLOCKED')}
                  className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    status === 'BLOCKED'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                  Tạm Khóa Tài Khoản
                </button>
              </div>
            )}
          </div>

          {/* Ghi chú quản trị */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Ghi Chú Quản Trị (Nội bộ)
              </label>
              {isLoadingDetail && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Đang tải ghi chú...
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Khách VIP thích giao hàng giờ hành chính, số điện thoại phụ..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 text-xs resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold bg-[#4880FF] hover:bg-[#3b6edc] text-white rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu Thay Đổi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;

