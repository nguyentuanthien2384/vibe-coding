'use client';

import { useState } from 'react';
import { PaymentSettings } from '../../types/settings.types';
import {
  CreditCard,
  Landmark,
  QrCode,
  DollarSign,
  MessageSquare,
  Sparkles,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface PaymentSettingsFormProps {
  data: PaymentSettings;
  onChange: (updated: PaymentSettings) => void;
}

const VIETNAMESE_BANKS = [
  { id: 'MB', name: 'MBBank (Ngân hàng Quân Đội)' },
  { id: 'VCB', name: 'Vietcombank (Ngân hàng Ngoại Thương Việt Nam)' },
  { id: 'TCB', name: 'Techcombank (Ngân hàng Kỹ Thương Việt Nam)' },
  { id: 'ACB', name: 'ACB (Ngân hàng Á Châu)' },
  { id: 'VPB', name: 'VPBank (Ngân hàng Việt Nam Thịnh Vượng)' },
  { id: 'TPB', name: 'TPBank (Ngân hàng Tiên Phong)' },
  { id: 'BIDV', name: 'BIDV (Ngân hàng Đầu tư và Phát triển)' },
  { id: 'ICB', name: 'VietinBank (Ngân hàng Công Thương Việt Nam)' },
  { id: 'STB', name: 'Sacombank (Ngân hàng Sài Gòn Thương Tín)' },
  { id: 'HDB', name: 'HDBank (Ngân hàng Phát triển TP.HCM)' },
  { id: 'SHB', name: 'SHB (Ngân hàng Sài Gòn - Hà Nội)' },
  { id: 'VIB', name: 'VIB (Ngân hàng Quốc Tế)' },
  { id: 'SEAB', name: 'SeABank (Ngân hàng Đông Nam Á)' },
  { id: 'OCB', name: 'OCB (Ngân hàng Phương Đông)' },
  { id: 'MSB', name: 'MSB (Ngân hàng Hàng Hải)' },
  { id: 'LPB', name: 'LPBank (Ngân hàng Lộc Phát Việt Nam)' },
  { id: 'CUSTOM', name: 'Ngân hàng khác (Tự nhập mã)' },
];

const PaymentSettingsForm = ({ data, onChange }: PaymentSettingsFormProps) => {
  const currentBankId = data.bankId || 'MB';
  const isCustomBank = !VIETNAMESE_BANKS.some((b) => b.id === currentBankId && b.id !== 'CUSTOM');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(isCustomBank);

  const handleChange = (field: keyof PaymentSettings, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleSelectBank = (selectedId: string) => {
    if (selectedId === 'CUSTOM') {
      setIsCustomMode(true);
      return;
    }
    setIsCustomMode(false);
    const bank = VIETNAMESE_BANKS.find((b) => b.id === selectedId);
    if (bank) {
      onChange({
        ...data,
        bankId: bank.id,
        bankName: bank.name,
      });
    }
  };

  // Thông số cho Live VietQR Preview
  const bankId = (data.bankId || 'MB').trim();
  const accountNo = (data.bankAccountNo || '9999888899').trim();
  const accountHolder = (data.bankAccountHolder || 'CTY TNHH TECHBITE VIETNAM').trim();
  const template = (data.vietQrTemplate || 'compact').trim();
  const previewQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=100000&addInfo=TB-DEMO123&accountName=${encodeURIComponent(accountHolder)}`;

  return (
    <div className="space-y-6">
      {/* Cấu hình tài khoản ngân hàng */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#4880FF]" />
            Cấu hình Tài Khoản Ngân Hàng & VietQR Code
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thiết lập thông tin tài khoản ngân hàng nhận thanh toán. Thông số này sẽ tự động áp dụng trực tiếp lên mã VietQR tại trang Thanh toán của khách hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chọn Ngân Hàng */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Chọn Ngân Hàng Thụ Hưởng <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={isCustomMode ? 'CUSTOM' : currentBankId}
                onChange={(e) => handleSelectBank(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white appearance-none"
              >
                {VIETNAMESE_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id !== 'CUSTOM' ? `[${b.id}] ` : ''}{b.name}
                  </option>
                ))}
              </select>
              <Landmark className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Bank ID (Mã Ngân hàng rút gọn VietQR) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mã Ngân Hàng VietQR (Bank ID / BIN Code) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.bankId || ''}
                onChange={(e) => handleChange('bankId', e.target.value.toUpperCase())}
                placeholder="Ví dụ: MB, VCB, TCB, 970422..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white font-mono uppercase"
              />
              <Landmark className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-400">
              Mã viết tắt chuẩn VietQR (VD: MB, VCB, TCB, ACB, VPB, TPB, BIDV, ICB...)
            </p>
          </div>

          {/* Tên Ngân Hàng Hiển Thị */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tên Ngân Hàng Đầy Đủ (Hiển thị cho khách) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="Ví dụ: MBBank (Ngân hàng Quân Đội)..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
              />
              <Landmark className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Số Tài Khoản */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Số Tài Khoản Ngân Hàng <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.bankAccountNo || ''}
                onChange={(e) => handleChange('bankAccountNo', e.target.value)}
                placeholder="Nhập STK nhận tiền..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white font-mono"
              />
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-400">
              Số tài khoản chính xác để khách quét mã hoặc copy chuyển tiền.
            </p>
          </div>

          {/* Tên Chủ Tài Khoản */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tên Chủ Tài Khoản (Viết hoa không dấu) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.bankAccountHolder || ''}
                onChange={(e) => handleChange('bankAccountHolder', e.target.value.toUpperCase())}
                placeholder="CTY TNHH..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white font-mono uppercase"
              />
              <Landmark className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Mẫu VietQR Template */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mẫu Giao Diện VietQR API
            </label>
            <div className="relative">
              <select
                value={data.vietQrTemplate || 'compact'}
                onChange={(e) => handleChange('vietQrTemplate', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white appearance-none"
              >
                <option value="compact">Gọn đẹp (Compact Template)</option>
                <option value="compact2">Gọn có logo ngân hàng (Compact 2 - Khuyên dùng)</option>
                <option value="qr_only">Chỉ có Mã QR (QR Only)</option>
                <option value="print">Bản In Đầy Đủ (Print Template)</option>
              </select>
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Bật/Tắt COD */}
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

          {/* Lời nhắn thanh toán */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Lời Nhắn Hướng Dẫn Thanh Toán (Hiển thị tại Modal Checkout VietQR)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={data.paymentNote || ''}
                onChange={(e) => handleChange('paymentNote', e.target.value)}
                placeholder="Nhập lời nhắn chuyển khoản (VD: Quý khách vui lòng không thay đổi nội dung chuyển khoản để đơn hàng được duyệt tự động)..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
              />
              <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Live VietQR Preview Card */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-slate-800/80 rounded-2xl border border-blue-100 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#4880FF]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Xem Trước Mã VietQR Thực Tế (Live Preview)
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tự động cập nhật theo cài đặt</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {/* QR Image Box */}
          <div className="w-48 h-48 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewQrUrl}
              alt="VietQR Preview"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                // Fallback nếu link QR lỗi
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Account Demo Details */}
          <div className="flex-1 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 w-full">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700">
              <span className="text-slate-500">Ngân hàng:</span>
              <span className="font-bold text-slate-900 dark:text-white">{data.bankName || 'MBBank'}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700">
              <span className="text-slate-500">Số tài khoản:</span>
              <span className="font-mono font-bold text-[#4880FF] text-sm">{data.bankAccountNo || '---'}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700">
              <span className="text-slate-500">Chủ tài khoản:</span>
              <span className="font-bold uppercase text-slate-900 dark:text-white">{data.bankAccountHolder || '---'}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700">
              <span className="text-slate-500">Số tiền (Demo):</span>
              <span className="font-mono font-bold text-rose-600">100.000 đ</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
              <span className="text-amber-800 dark:text-amber-300 font-semibold">Nội dung CK:</span>
              <span className="font-mono font-extrabold text-amber-900 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                TB-DEMO123 (Mã đơn hàng)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsForm;
