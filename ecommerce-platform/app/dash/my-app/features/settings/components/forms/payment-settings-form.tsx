'use client';

import { PaymentSettings } from '../../types/settings.types';
import { CreditCard, Landmark, QrCode, DollarSign, MessageSquare } from 'lucide-react';

interface PaymentSettingsFormProps {
  data: PaymentSettings;
  onChange: (updated: PaymentSettings) => void;
}

const PaymentSettingsForm = ({ data, onChange }: PaymentSettingsFormProps) => {
  const handleChange = (field: keyof PaymentSettings, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#4880FF]" />
          Cấu hình Thanh toán & VietQR Code
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Thiết lập thông tin tài khoản ngân hàng nhận tiền qua VietQR tự động và phương thức COD.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Ngân Hàng Thụ Hưởng VietQR <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              placeholder="Ví dụ: MB Bank..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
            <Landmark className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Bank Account Number */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Số Tài Khoản Ngân Hàng <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.bankAccountNo}
              onChange={(e) => handleChange('bankAccountNo', e.target.value)}
              placeholder="Nhập STK..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white font-mono"
            />
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Bank Account Holder */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tên Chủ Tài Khoản (Viết hoa không dấu) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.bankAccountHolder}
              onChange={(e) => handleChange('bankAccountHolder', e.target.value.toUpperCase())}
              placeholder="CTY TNHH..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white font-mono uppercase"
            />
            <Landmark className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* VietQR Template */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mẫu Giao Diện QR Code (VietQR API)
          </label>
          <div className="relative">
            <select
              value={data.vietQrTemplate}
              onChange={(e) => handleChange('vietQrTemplate', e.target.value as any)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white appearance-none"
            >
              <option value="compact">Gọn đẹp (Compact Template)</option>
              <option value="qr_only">Chỉ có Mã QR (QR Only)</option>
              <option value="print">Bản In Đầy Đủ (Print Template)</option>
            </select>
            <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Enable COD Switch */}
        <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Thanh toán khi nhận hàng (COD)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cho phép khách hàng lựa chọn trả tiền mặt trực tiếp cho Shipper sau khi kiểm tra hàng.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.enableCod}
              onChange={(e) => handleChange('enableCod', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4880FF]"></div>
          </label>
        </div>

        {/* Payment Note */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Lời Nhắn Hướng Dẫn Thanh Toán (Hiển thị tại Modal Checkout VietQR)
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={data.paymentNote || ''}
              onChange={(e) => handleChange('paymentNote', e.target.value)}
              placeholder="Nhập lời nhắn chuyển khoản..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
            <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsForm;
