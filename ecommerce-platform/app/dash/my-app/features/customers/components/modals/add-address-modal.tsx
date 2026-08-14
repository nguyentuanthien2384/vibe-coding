'use client';

import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { CustomerAddress } from '../../types/customer.types';

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: Omit<CustomerAddress, 'id'>) => Promise<void>;
}

const AddAddressModal = ({ isOpen, onClose, onSubmit }: AddAddressModalProps) => {
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [provinceName, setProvinceName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [wardName, setWardName] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !phone.trim() || !detailAddress.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Tên người nhận, SĐT và Địa chỉ chi tiết.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmit({
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        provinceName: provinceName.trim() || 'Thành phố Hồ Chí Minh',
        districtName: districtName.trim() || 'Quận 1',
        wardName: wardName.trim() || 'Phường Bến Nghé',
        detailAddress: detailAddress.trim(),
        isDefault,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Thêm địa chỉ thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#4880FF]" />
            Thêm Địa Chỉ Mới Cho Khách Hàng
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên người nhận <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Số điện thoại người nhận <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={provinceName}
              onChange={(e) => setProvinceName(e.target.value)}
              placeholder="Tỉnh/Thành"
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
            <input
              type="text"
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              placeholder="Quận/Huyện"
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
            <input
              type="text"
              value={wardName}
              onChange={(e) => setWardName(e.target.value)}
              placeholder="Phường/Xã"
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Địa chỉ chi tiết <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="Số nhà, đường..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <label className="flex items-center space-x-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-[#4880FF] rounded border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Đặt làm địa chỉ nhận hàng mặc định
            </span>
          </label>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              className="px-4 py-2 text-xs font-semibold bg-[#4880FF] hover:bg-[#3b6edc] text-white rounded-xl shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Đang thêm...' : 'Thêm Địa Chỉ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddressModal;
