'use client';

import { GeneralSettings } from '../../types/settings.types';
import { ImageUploader } from '../../../../components/ui/image-uploader';
import {
  Store,
  Mail,
  Phone,
  PhoneCall,
  MapPin,
  FileText,
  Clock,
  Hash,
  TriangleAlert,
} from 'lucide-react';

interface GeneralSettingsFormProps {
  data: GeneralSettings;
  onChange: (updated: GeneralSettings) => void;
}

const inputClass =
  'w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white';

const GeneralSettingsForm = ({ data, onChange }: GeneralSettingsFormProps) => {
  const handle = (field: keyof GeneralSettings, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-8">
      {/* ─── Section: Thông tin cơ bản ─── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Store className="w-5 h-5 text-[#4880FF]" />
          Thông tin cơ bản về cửa hàng
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Cấu hình tên thương hiệu, logo, thông tin liên hệ hiển thị ở Header & Footer ngoài khách
          hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Name */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tên Cửa Hàng / Website <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.storeName}
              onChange={(e) => handle('storeName', e.target.value)}
              placeholder="Nhập tên thương hiệu..."
              className={inputClass}
            />
            <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Store Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Email Hỗ Trợ Khách Hàng <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={data.storeEmail}
              onChange={(e) => handle('storeEmail', e.target.value)}
              placeholder="contact@domain.com"
              className={inputClass}
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Store Phone */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Số Điện Thoại Chính <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.storePhone}
              onChange={(e) => handle('storePhone', e.target.value)}
              placeholder="1900 xxxx"
              className={inputClass}
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Hotline */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Hotline Khẩn Cấp (Tuỳ chọn)
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.hotline ?? ''}
              onChange={(e) => handle('hotline', e.target.value)}
              placeholder="0988 xxx xxx"
              className={inputClass}
            />
            <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Working Hours */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Giờ Làm Việc
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.workingHours ?? ''}
              onChange={(e) => handle('workingHours', e.target.value)}
              placeholder="08:00 - 22:00 (Thứ 2 - Chủ Nhật)"
              className={inputClass}
            />
            <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Store Address */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Địa Chỉ Trụ Sở Chính
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.storeAddress}
              onChange={(e) => handle('storeAddress', e.target.value)}
              placeholder="Nhập địa chỉ trụ sở..."
              className={inputClass}
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Tax Code */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mã Số Thuế (MST)
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.taxCode ?? ''}
              onChange={(e) => handle('taxCode', e.target.value)}
              placeholder="010998xxxx"
              className={inputClass}
            />
            <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Copyright Text */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Thông Tin Bản Quyền Footer (Copyright)
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.copyrightText}
              onChange={(e) => handle('copyrightText', e.target.value)}
              placeholder="© 2026 TechBite..."
              className={inputClass}
            />
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Logo Uploader */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Logo Website (PNG, SVG, WebP)
          </label>
          <ImageUploader
            value={data.logoUrl || ''}
            onChange={(url: string) => handle('logoUrl', url)}
          />
        </div>

        {/* Favicon Uploader */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Favicon Icon Trình Duyệt (.ico, PNG)
          </label>
          <ImageUploader
            value={data.faviconUrl || ''}
            onChange={(url: string) => handle('faviconUrl', url)}
          />
        </div>
      </div>

      {/* ─── Section: Chế độ bảo trì ─── */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TriangleAlert className="w-4 h-4 text-amber-500" />
          Chế Độ Bảo Trì Hệ Thống (Maintenance Mode)
        </h3>

        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Kích hoạt Chế Độ Bảo Trì
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Khi bật, khách truy cập Storefront sẽ thấy thông báo bảo trì thay vì nội dung website.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handle('maintenanceMode', !data.maintenanceMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              data.maintenanceMode ? 'bg-amber-500' : 'bg-gray-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                data.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {data.maintenanceMode && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Thông báo bảo trì (Hiển thị cho khách truy cập)
            </label>
            <textarea
              rows={2}
              value={data.maintenanceMessage ?? ''}
              onChange={(e) => handle('maintenanceMessage', e.target.value)}
              placeholder="Hệ thống đang bảo trì nâng cấp định kỳ. Vui lòng quay lại sau ít phút!"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralSettingsForm;
