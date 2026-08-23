'use client';

import { useState } from 'react';
import { X, UserPlus, MapPin, UserCheck, User, FileText } from 'lucide-react';
import { CreateCustomerInput, CustomerType } from '../types/customer.types';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateCustomerInput) => Promise<void>;
}

const CreateCustomerModal = ({ isOpen, onClose, onSubmit }: CreateCustomerModalProps) => {
  const [customerType, setCustomerType] = useState<CustomerType>('REGISTERED');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [provinceName, setProvinceName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [wardName, setWardName] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isGuest = customerType === 'GUEST';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng điền Họ và tên khách hàng.');
      return;
    }

    if (!isGuest) {
      if (!email.trim() || !phone.trim()) {
        setErrorMsg('Khách hàng thành viên bắt buộc phải có đầy đủ Email và Số điện thoại.');
        return;
      }

      // Kiểm tra quy tắc mật khẩu nếu người dùng tự điền
      if (password.trim()) {
        const pass = password.trim();
        const hasLetterAndDigit = /^(?=.*[a-zA-Z])(?=.*\d)/.test(pass);
        if (pass.length < 6 || pass.length > 50 || !hasLetterAndDigit) {
          setErrorMsg('Mật khẩu phải từ 6 đến 50 ký tự và chứa ít nhất một chữ cái và một chữ số (Ví dụ: Password123).');
          return;
        }
      }
    } else {
      if (!phone.trim() && !email.trim()) {
        setErrorMsg('Khách hàng vãng lai cần ít nhất Số điện thoại hoặc Email để liên hệ.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmit({
        type: customerType,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password: !isGuest && password.trim() ? password.trim() : undefined,
        notes: notes.trim() || undefined,
        address: provinceName && detailAddress ? {
          recipientName: fullName.trim(),
          phone: phone.trim(),
          provinceName: provinceName.trim(),
          districtName: districtName.trim(),
          wardName: wardName.trim(),
          detailAddress: detailAddress.trim(),
        } : undefined,
      });

      // Reset form
      setCustomerType('REGISTERED');
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setNotes('');
      setProvinceName('');
      setDistrictName('');
      setWardName('');
      setDetailAddress('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể tạo khách hàng, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#4880FF]" />
            Tạo Khách Hàng Thủ Công
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* Bộ chọn Loại Khách Hàng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Loại Khách Hàng <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCustomerType('REGISTERED')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  customerType === 'REGISTERED'
                    ? 'border-[#4880FF] bg-blue-50/70 dark:bg-blue-950/40 text-slate-800 dark:text-white shadow-sm ring-1 ring-[#4880FF]'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#4880FF]">
                  <UserCheck className="w-4 h-4" />
                  <span>Khách Thành Viên</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                  Tạo tài khoản đăng nhập, cấp mật khẩu khởi tạo
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCustomerType('GUEST')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  customerType === 'GUEST'
                    ? 'border-[#4880FF] bg-blue-50/70 dark:bg-blue-950/40 text-slate-800 dark:text-white shadow-sm ring-1 ring-[#4880FF]'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-600 dark:text-amber-400">
                  <User className="w-4 h-4" />
                  <span>Khách Vãng Lai</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                  Lưu thông tin mua lẻ, không tạo tài khoản đăng nhập
                </p>
              </button>
            </div>
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

          {/* Email & SĐT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email {!isGuest && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="email"
                required={!isGuest}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="an.nguyen@example.com"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số Điện Thoại {!isGuest && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="tel"
                required={!isGuest}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30"
              />
            </div>
          </div>

          {/* Mật khẩu khởi tạo (Chỉ dành cho Thành viên) */}
          {!isGuest && (
            <div className="p-3 bg-blue-50/50 dark:bg-slate-800/60 rounded-xl border border-blue-100 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mật khẩu khởi tạo
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mặc định: Password123 (nếu để trống)"
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Tối thiểu 6 ký tự, gồm ít nhất một chữ cái và một chữ số.
              </p>
            </div>
          )}

          {/* Ghi chú quản trị */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Ghi Chú Quản Trị (Nội bộ)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Khách sỉ quen, gọi trước khi giao..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 text-xs resize-none"
            />
          </div>

          {/* Địa chỉ giao hàng ban đầu */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#4880FF]" />
              Địa Chỉ Giao Hàng Ban Đầu (Không bắt buộc)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <input
                type="text"
                value={provinceName}
                onChange={(e) => setProvinceName(e.target.value)}
                placeholder="Tỉnh/Thành phố"
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
              <input
                type="text"
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                placeholder="Quận/Huyện"
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
              <input
                type="text"
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                placeholder="Phường/Xã"
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <input
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="Số nhà, tên đường chi tiết..."
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
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
              {isSubmitting ? 'Đang tạo...' : 'Xác Nhận Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
