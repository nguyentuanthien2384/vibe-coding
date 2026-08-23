'use client';

import { useState, useEffect } from 'react';
import { X, Edit3, ShieldAlert, ShieldCheck, FileText, User, Mail, Phone, Loader2, UserCheck, Sparkles, Key } from 'lucide-react';
import { CustomerListItem, CustomerStatus, CustomerType, UpdateCustomerInfoInput } from '../types/customer.types';
import CustomerTypeBadge from './customer-type-badge';
import { getCustomerById } from '../api/customers-api';

interface EditCustomerModalProps {
  customer: CustomerListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: UpdateCustomerInfoInput) => Promise<void>;
}

const EditCustomerModal = ({ customer, isOpen, onClose, onSubmit }: EditCustomerModalProps) => {
  const [customerType, setCustomerType] = useState<CustomerType>('REGISTERED');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('ACTIVE');
  const [notes, setNotes] = useState('');

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (customer && isOpen) {
      setErrorMsg('');
      setCustomerType(customer.type || 'REGISTERED');
      setFullName(customer.fullName.replace(/\s*\(Khách vãng lai\)$/i, '') || '');
      setEmail(customer.email === 'Chưa cung cấp' ? '' : customer.email || '');
      setPhone(customer.phone === 'Chưa cập nhật' ? '' : customer.phone || '');
      setPassword('');
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

  const isConvertingToRegistered = customer.type === 'GUEST' && customerType === 'REGISTERED';
  const isFinalRegistered = customerType === 'REGISTERED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên khách hàng.');
      return;
    }

    if (isFinalRegistered) {
      if (!email.trim()) {
        setErrorMsg('Khách hàng thành viên bắt buộc phải có Email hợp lệ để đăng nhập.');
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Khách hàng thành viên bắt buộc phải có Số điện thoại.');
        return;
      }

      if (password.trim()) {
        const pass = password.trim();
        const hasLetterAndDigit = /^(?=.*[a-zA-Z])(?=.*\d)/.test(pass);
        if (pass.length < 6 || pass.length > 50 || !hasLetterAndDigit) {
          setErrorMsg('Mật khẩu phải từ 6 đến 50 ký tự và chứa ít nhất một chữ cái và một chữ số (Ví dụ: Password123).');
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmit({
        customerId: customer.id,
        type: customerType,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password.trim() || undefined,
        status: isFinalRegistered ? status : 'ACTIVE',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 my-8">
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
          {/* Chuyển đổi Loại Tài Khoản */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Loại Tài Khoản Khách Hàng
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCustomerType('REGISTERED')}
                className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  customerType === 'REGISTERED'
                    ? 'border-[#4880FF] bg-blue-50/80 text-[#4880FF] dark:bg-blue-950/50 dark:text-blue-400 shadow-sm ring-1 ring-[#4880FF]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4 mr-1.5" />
                Khách Thành Viên
              </button>

              <button
                type="button"
                onClick={() => setCustomerType('GUEST')}
                className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  customerType === 'GUEST'
                    ? 'border-amber-500 bg-amber-50/80 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 shadow-sm ring-1 ring-amber-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4 mr-1.5" />
                Khách Vãng Lai
              </button>
            </div>

            {isConvertingToRegistered && (
              <div className="mt-2.5 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2 animate-fade-in">
                <Sparkles className="w-4 h-4 text-[#4880FF] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Nâng cấp lên Khách thành viên:</span> Hệ thống sẽ tạo tài khoản đăng nhập và tự động liên kết toàn bộ lịch sử đơn hàng của khách hàng này.
                </div>
              </div>
            )}
          </div>

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
                Email {isFinalRegistered && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required={isFinalRegistered}
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
                Số Điện Thoại {isFinalRegistered && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required={isFinalRegistered}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Mật khẩu khởi tạo (Hiển thị khi chuyển đổi từ Vãng lai sang Thành viên) */}
          {isConvertingToRegistered && (
            <div className="p-3 bg-blue-50/60 dark:bg-slate-800/80 rounded-xl border border-blue-100 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#4880FF]" />
                Mật Khẩu Khởi Tạo Cho Tài Khoản
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mặc định: Password123 (nếu để trống)"
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 text-xs"
              />
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Tối thiểu 6 ký tự gồm chữ cái và số. Khách hàng có thể dùng mật khẩu này để đăng nhập.
              </p>
            </div>
          )}

          {/* Trạng thái tài khoản */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Trạng Thái Tài Khoản
            </label>
            {!isFinalRegistered ? (
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
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500'
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
                      ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shadow-sm ring-1 ring-rose-500'
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
                <span>{isConvertingToRegistered ? 'Chuyển Đổi & Lưu' : 'Lưu Thay Đổi'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;

