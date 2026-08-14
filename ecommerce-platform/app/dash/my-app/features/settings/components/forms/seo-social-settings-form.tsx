'use client';

import { SeoSocialSettings } from '../../types/settings.types';
import { Globe, Search, Share2, Tag } from 'lucide-react';

interface SeoSocialSettingsFormProps {
  data: SeoSocialSettings;
  onChange: (updated: SeoSocialSettings) => void;
}

const SeoSocialSettingsForm = ({ data, onChange }: SeoSocialSettingsFormProps) => {
  const handleChange = (field: keyof SeoSocialSettings, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#4880FF]" />
          Cấu hình SEO Meta & Mạng Xã Hội
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tối ưu hóa công cụ tìm kiếm (Google, Bing) và các đường liên kết social ngoài trang chủ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta Title */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Thẻ Tiêu Đề Mặc Định (Meta Title Tag) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.metaTitle}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              placeholder="Nhập tiêu đề website SEO..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-slate-400">
            Khuyên dùng từ 50 - 60 ký tự. Hiển thị trực tiếp trên kết quả tìm kiếm Google.
          </p>
        </div>

        {/* Meta Description */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Thẻ Mô Tả Mặc Định (Meta Description Tag)
          </label>
          <textarea
            rows={3}
            value={data.metaDescription}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            placeholder="Mô tả tóm tắt nội dung thương hiệu..."
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
          />
          <p className="text-[11px] text-slate-400">
            Khuyên dùng từ 120 - 160 ký tự giúp tăng tỷ lệ click (CTR).
          </p>
        </div>

        {/* Meta Keywords */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Từ Khóa Tìm Kiếm (Meta Keywords - Phân cách bằng dấu phẩy)
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.metaKeywords}
              onChange={(e) => handleChange('metaKeywords', e.target.value)}
              placeholder="TechBite, E-commerce, Đồ công nghệ..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
            <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Social Links Divider */}
        <div className="md:col-span-2 pt-2 border-t border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Share2 className="w-4 h-4 text-[#4880FF]" />
            Liên Kết Trang Mạng Xã Hội (Social Links)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Facebook */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Facebook Fanpage URL
              </label>
              <input
                type="text"
                value={data.facebookUrl || ''}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/page"
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
              />
            </div>

            {/* Zalo */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Zalo Official Account / Phone Link
              </label>
              <input
                type="text"
                value={data.zaloUrl || ''}
                onChange={(e) => handleChange('zaloUrl', e.target.value)}
                placeholder="https://zalo.me/..."
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Instagram Profile URL
              </label>
              <input
                type="text"
                value={data.instagramUrl || ''}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
              />
            </div>

            {/* TikTok */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                TikTok Channel URL
              </label>
              <input
                type="text"
                value={data.tiktokUrl || ''}
                onChange={(e) => handleChange('tiktokUrl', e.target.value)}
                placeholder="https://tiktok.com/@..."
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoSocialSettingsForm;
