'use client';

import { ShippingSettings } from '../../types/settings.types';
import { Truck, DollarSign, Clock, ShieldAlert } from 'lucide-react';

interface ShippingSettingsFormProps {
  data: ShippingSettings;
  onChange: (updated: ShippingSettings) => void;
}

const ShippingSettingsForm = ({ data, onChange }: ShippingSettingsFormProps) => {
  const handleChange = (field: keyof ShippingSettings, value: string | number) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#4880FF]" />
          Cấu hình Phí Vận Chuyển & Giao Hàng
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Thiết lập mức phí ship tiêu chuẩn, chính sách miễn phí vận chuyển cho đơn hàng lớn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Default Shipping Fee */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Phí Giao Hàng Mặc Định (VNĐ) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={1000}
              value={data.defaultShippingFee}
              onChange={(e) => handleChange('defaultShippingFee', Number(e.target.value))}
              placeholder="30000"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-slate-400">
            Mức phí áp dụng mặc định cho các đơn hàng chưa đủ điều kiện miễn phí.
          </p>
        </div>

        {/* Free Shipping Threshold */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Ngưỡng Miễn Phí Vận Chuyển (Freeship Threshold - VNĐ)
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={50000}
              value={data.freeShippingThreshold}
              onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
              placeholder="500000"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-extrabold focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-[#4880FF]"
            />
            <Truck className="w-4 h-4 text-[#4880FF] absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-slate-400">
            Khi giá trị đơn hàng vượt ngưỡng này, phí giao hàng sẽ tự động bằng 0đ.
          </p>
        </div>

        {/* Estimated Delivery Time */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Thời Gian Giao Hàng Dự Kiến (Hiển thị tại trang Checkout)
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.estimatedDeliveryTime}
              onChange={(e) => handleChange('estimatedDeliveryTime', e.target.value)}
              placeholder="Ví dụ: 24 - 48 giờ đối với nội thành..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
            <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#4880FF] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white">
            Quy tắc tự động tính phí vận chuyển
          </p>
          <p>
            Mọi tính toán tổng tiền đơn hàng BẮT BUỘC thực hiện từ phía Backend để đảm bảo tính an toàn tài chính. Giá trị phí ship tại đây sẽ được hệ thống áp dụng đồng bộ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingSettingsForm;
