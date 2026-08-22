'use client';

import { SeoSocialSettings } from '../../types/settings.types';
import { Globe, Search, Share2, Tag, Image, Code, BarChart2, MessageSquare } from 'lucide-react';

interface SeoSocialSettingsFormProps {
  data: SeoSocialSettings;
  onChange: (updated: SeoSocialSettings) => void;
}

const inputClass =
  'w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white';

const inputIconClass =
  'w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white';

const SeoSocialSettingsForm = ({ data, onChange }: SeoSocialSettingsFormProps) => {
  const handle = (field: keyof SeoSocialSettings, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-8">
      {/* ─── Header ─── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#4880FF]" />
          Cấu hình SEO Meta & Mạng Xã Hội
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tối ưu hóa công cụ tìm kiếm (Google, Bing), Open Graph và các đường liên kết social.
        </p>
      </div>

      {/* ─── Section 1: SEO Cơ bản ─── */}
      <div className="space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-[#4880FF]" />
          Thẻ Meta Cơ Bản (Basic SEO)
        </h3>

        <div className="grid grid-cols-1 gap-5">
          {/* Meta Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Thẻ Tiêu Đề Mặc Định (Meta Title){' '}
              <span className="text-rose-500">*</span>
              <span className="ml-2 text-slate-400 font-normal">
                ({data.metaTitle?.length ?? 0}/120 ký tự)
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.metaTitle}
                onChange={(e) => handle('metaTitle', e.target.value)}
                maxLength={120}
                placeholder="Nhập tiêu đề website SEO..."
                className={inputIconClass}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-400">
              Khuyên dùng từ 50 - 60 ký tự. Hiển thị trực tiếp trên kết quả tìm kiếm Google.
            </p>
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Thẻ Mô Tả Mặc Định (Meta Description)
              <span className="ml-2 text-slate-400 font-normal">
                ({data.metaDescription?.length ?? 0}/300 ký tự)
              </span>
            </label>
            <textarea
              rows={3}
              value={data.metaDescription}
              maxLength={300}
              onChange={(e) => handle('metaDescription', e.target.value)}
              placeholder="Mô tả tóm tắt nội dung thương hiệu..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-400">
              Khuyên dùng từ 120 - 160 ký tự giúp tăng tỷ lệ click (CTR).
            </p>
          </div>

          {/* Meta Keywords */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Từ Khóa Tìm Kiếm (Meta Keywords — phân cách bằng dấu phẩy)
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.metaKeywords}
                onChange={(e) => handle('metaKeywords', e.target.value)}
                placeholder="TechBite, E-commerce, Đồ công nghệ..."
                className={inputIconClass}
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Canonical URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Canonical URL
              </label>
              <input
                type="text"
                value={data.canonicalUrl ?? ''}
                onChange={(e) => handle('canonicalUrl', e.target.value)}
                placeholder="https://techbite.vn"
                className={inputClass}
              />
            </div>

            {/* Meta Robots */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Meta Robots
              </label>
              <select
                value={data.metaRobots ?? 'index, follow'}
                onChange={(e) => handle('metaRobots', e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
              >
                <option value="index, follow">index, follow (Mặc định — cho Google thu thập)</option>
                <option value="noindex, nofollow">noindex, nofollow (Ẩn khỏi Google)</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="index, nofollow">index, nofollow</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 2: Open Graph ─── */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Image className="w-4 h-4 text-[#4880FF]" />
          Open Graph (Facebook, Zalo, LinkedIn Preview)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              OG Title
            </label>
            <input
              type="text"
              value={data.ogTitle ?? ''}
              onChange={(e) => handle('ogTitle', e.target.value)}
              placeholder="Tiêu đề khi chia sẻ lên Facebook..."
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              OG Image URL (1200x630px)
            </label>
            <input
              type="text"
              value={data.ogImageUrl ?? ''}
              onChange={(e) => handle('ogImageUrl', e.target.value)}
              placeholder="/uploads/images/og-banner.jpg"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              OG Description
            </label>
            <textarea
              rows={2}
              value={data.ogDescription ?? ''}
              onChange={(e) => handle('ogDescription', e.target.value)}
              placeholder="Mô tả khi chia sẻ lên mạng xã hội..."
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* ─── Section 3: Twitter Card ─── */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#4880FF]" />
          Twitter / X Cards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Twitter Card Type
            </label>
            <select
              value={data.twitterCard ?? 'summary_large_image'}
              onChange={(e) => handle('twitterCard', e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
            >
              <option value="summary_large_image">summary_large_image (Ảnh lớn)</option>
              <option value="summary">summary (Ảnh nhỏ)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Twitter Site (@handle)
            </label>
            <input
              type="text"
              value={data.twitterSite ?? ''}
              onChange={(e) => handle('twitterSite', e.target.value)}
              placeholder="@techbite_vn"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ─── Section 4: Social Links ─── */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#4880FF]" />
          Liên Kết Mạng Xã Hội (Social Links)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { field: 'facebookUrl' as const, label: 'Facebook Fanpage URL', placeholder: 'https://facebook.com/page' },
            { field: 'zaloUrl' as const, label: 'Zalo Official Account', placeholder: 'https://zalo.me/...' },
            { field: 'instagramUrl' as const, label: 'Instagram Profile URL', placeholder: 'https://instagram.com/...' },
            { field: 'tiktokUrl' as const, label: 'TikTok Channel URL', placeholder: 'https://tiktok.com/@...' },
            { field: 'youtubeUrl' as const, label: 'YouTube Channel URL', placeholder: 'https://youtube.com/@...' },
          ].map(({ field, label, placeholder }) => (
            <div key={field} className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {label}
              </label>
              <input
                type="text"
                value={data[field] ?? ''}
                onChange={(e) => handle(field, e.target.value)}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Section 5: Google & Analytics ─── */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#4880FF]" />
          Google & Analytics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Google Site Verification Token
            </label>
            <input
              type="text"
              value={data.googleSiteVerification ?? ''}
              onChange={(e) => handle('googleSiteVerification', e.target.value)}
              placeholder="google-site-verification=..."
              className={inputClass}
            />
            <p className="text-[11px] text-slate-400">
              Lấy từ Google Search Console → Xác minh quyền sở hữu website.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Google Analytics 4 Measurement ID
            </label>
            <input
              type="text"
              value={data.googleAnalyticsId ?? ''}
              onChange={(e) => handle('googleAnalyticsId', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className={inputClass}
            />
            <p className="text-[11px] text-slate-400">
              Đo lường lưu lượng & hành vi người dùng theo thời gian thực.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Section 6: Custom Scripts ─── */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-[#4880FF]" />
          Custom Scripts (Nâng cao)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Thêm code tùy chỉnh cho thẻ{' '}
          <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;head&gt;</code> hoặc{' '}
          <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;body&gt;</code> (Google
          Tag Manager, Facebook Pixel, Hotjar...).
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Custom Head Script (Chèn vào &lt;head&gt;)
            </label>
            <textarea
              rows={4}
              value={data.customHeadScript ?? ''}
              onChange={(e) => handle('customHeadScript', e.target.value)}
              placeholder="<!-- Google Tag Manager -->"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Custom Body Script (Chèn sau &lt;body&gt;)
            </label>
            <textarea
              rows={4}
              value={data.customBodyScript ?? ''}
              onChange={(e) => handle('customBodyScript', e.target.value)}
              placeholder="<!-- Facebook Pixel -->"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-[#4880FF] text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoSocialSettingsForm;
