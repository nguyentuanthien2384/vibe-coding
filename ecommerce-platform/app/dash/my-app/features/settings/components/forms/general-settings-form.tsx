'use client';

import { GeneralSettings } from '../../types/settings.types';
import { ImageUploader } from '../../../../components/ui/image-uploader';
import { Store, Mail, Phone, MapPin, FileText } from 'lucide-react';

interface GeneralSettingsFormProps {
  data: GeneralSettings;
  onChange: (updated: GeneralSettings) => void;
}

const GeneralSettingsForm = ({ data, onChange }: GeneralSettingsFormProps) => {
  const handleChange = (field: keyof GeneralSettings, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Store className="w-5 h-5 text-[#4880FF]" />
          Thông tin cơ bản về cửa hàng
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Cấu hình tên thương hiệu, logo, thông tin liên hệ hiển thị ở Header & Footer ngoài khách hàng.
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
              onChange={(e) => handleChange('storeName', e.target.value)}
              placeholder="Nhập tên thương hiệu..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
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
              onChange={(e) => handleChange('storeEmail', e.target.value)}
              placeholder="contact@domain.com"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Store Phone */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Hotline Tư Vấn / Điện Thoại <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.storePhone}
              onChange={(e) => handleChange('storePhone', e.target.value)}
              placeholder="1900 xxxx"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
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
              onChange={(e) => handleChange('storeAddress', e.target.value)}
              placeholder="Nhập địa chỉ trụ sở..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Copyright Text */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Thông Tin Bản Quyền Footer (Copyright)
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.copyrightText}
              onChange={(e) => handleChange('copyrightText', e.target.value)}
              placeholder="© 2026 TechBite..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
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
            onChange={(url: string) => handleChange('logoUrl', url)}
          />
        </div>

        {/* Favicon Uploader */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Favicon Icon Trình Duyệt (.ico, PNG)
          </label>
          <ImageUploader
            value={data.faviconUrl || ''}
            onChange={(url: string) => handleChange('faviconUrl', url)}
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsForm;
