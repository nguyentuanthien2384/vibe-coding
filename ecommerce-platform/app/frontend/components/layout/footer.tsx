import React from 'react';
import Link from 'next/link';
import { getImageUrl } from '../../lib/image-url';
import { GeneralSettings, MenuItemSetting, SeoSocialSettings } from '../../types/settings';

interface FooterProps {
  generalSettings?: GeneralSettings;
  menus?: MenuItemSetting[];
  seo?: SeoSocialSettings;
}

export const Footer: React.FC<FooterProps> = ({
  generalSettings,
  menus,
  seo,
}) => {
  const storeName = generalSettings?.storeName || 'TechBite';
  const logoUrl = generalSettings?.logoUrl ? getImageUrl(generalSettings.logoUrl) : null;
  const storeEmail = generalSettings?.storeEmail || 'contact@techbite.vn';
  const storePhone = generalSettings?.storePhone || '1900 6868';
  const hotline = generalSettings?.hotline;
  const storeAddress = generalSettings?.storeAddress || 'Tầng 12, Tòa nhà Innovation Tower, Cầu Giấy, Hà Nội';
  const workingHours = generalSettings?.workingHours || '08:00 - 22:00 (Thứ 2 - Chủ Nhật)';
  const copyrightText = generalSettings?.copyrightText || '© 2026 TechBite E-Commerce. All rights reserved.';
  const taxCode = generalSettings?.taxCode;

  // Lọc các menu footer theo từng cột
  const col1Menus = (menus && menus.length > 0)
    ? menus.filter((m) => m.location === 'FOOTER_COL1' && m.isActive !== false).sort((a, b) => a.order - b.order)
    : [
        { id: 'f-1', title: '🍟 Đồ ăn vặt đêm', targetUrl: '/categories/do-an-vat', location: 'FOOTER_COL1', order: 1, openInNewTab: false, isActive: true },
        { id: 'f-2', title: '🧃 Nước tăng lực & Cà phê', targetUrl: '/categories/nuoc-uong', location: 'FOOTER_COL1', order: 2, openInNewTab: false, isActive: true },
        { id: 'f-3', title: '💻 Combo Chạy Deadline', targetUrl: '/categories/combo-deadline', location: 'FOOTER_COL1', order: 3, openInNewTab: false, isActive: true },
        { id: 'f-4', title: '🔥 Ưu đãi Hot hôm nay', targetUrl: '/products', location: 'FOOTER_COL1', order: 4, openInNewTab: false, isActive: true },
      ];

  const col2Menus = (menus && menus.length > 0)
    ? menus.filter((m) => m.location === 'FOOTER_COL2' && m.isActive !== false).sort((a, b) => a.order - b.order)
    : [
        { id: 'f-5', title: 'Chính sách giao hàng 15p', targetUrl: '/policy/shipping', location: 'FOOTER_COL2', order: 1, openInNewTab: false, isActive: true },
        { id: 'f-6', title: 'Chính sách đổi trả & Hoàn tiền', targetUrl: '/policy/return', location: 'FOOTER_COL2', order: 2, openInNewTab: false, isActive: true },
        { id: 'f-7', title: 'Câu hỏi thường gặp (FAQ)', targetUrl: '/faq', location: 'FOOTER_COL2', order: 3, openInNewTab: false, isActive: true },
        { id: 'f-8', title: 'Liên hệ Hotline 24/7', targetUrl: '/contact', location: 'FOOTER_COL2', order: 4, openInNewTab: false, isActive: true },
      ];

  const col3Menus = (menus && menus.length > 0)
    ? menus.filter((m) => m.location === 'FOOTER_COL3' && m.isActive !== false).sort((a, b) => a.order - b.order)
    : [];

  // Social Links từ SEO
  const socialLinks = [
    { label: 'FB', name: 'Facebook', url: seo?.facebookUrl || 'https://facebook.com' },
    { label: 'ZL', name: 'Zalo', url: seo?.zaloUrl || 'https://zalo.me' },
    { label: 'IG', name: 'Instagram', url: seo?.instagramUrl || 'https://instagram.com' },
    { label: 'TT', name: 'TikTok', url: seo?.tiktokUrl || 'https://tiktok.com' },
    { label: 'YT', name: 'YouTube', url: seo?.youtubeUrl || 'https://youtube.com' },
  ].filter((s) => !!s.url);

  return (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Cột 1: Thông tin thương hiệu & Địa chỉ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={storeName} className="w-8 h-8 object-contain rounded-lg" />
              ) : (
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
                  ⚡
                </div>
              )}
              <span className="text-xl font-extrabold tracking-tight">
                {storeName}
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Đồ ăn &amp; thức uống tiếp năng lượng cho dân lập trình. Giao nhanh 15–30 phút, giải cứu mọi deadline.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <span className="text-orange-500 shrink-0 mt-0.5">📍</span>
                <span>{storeAddress}</span>
              </p>
              {workingHours && (
                <p className="flex items-center gap-2">
                  <span className="text-orange-500 shrink-0">⏰</span>
                  <span>{workingHours}</span>
                </p>
              )}
              {taxCode && (
                <p className="text-[11px] text-slate-500">
                  MST: <span className="text-slate-400 font-mono">{taxCode}</span>
                </p>
              )}
            </div>
          </div>

          {/* Cột 2: Footer Menus 1 (Danh mục / Thực đơn) */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
              Danh mục thực đơn
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              {col1Menus.map((item) => {
                const isExternal = item.openInNewTab || item.targetUrl.startsWith('http');
                if (isExternal) {
                  return (
                    <li key={item.id}>
                      <a
                        href={item.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-orange-400 transition-colors inline-block"
                      >
                        {item.title}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={item.id}>
                    <Link href={item.targetUrl} className="hover:text-orange-400 transition-colors inline-block">
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Cột 3: Footer Menus 2 (Hỗ trợ khách hàng / Chính sách) */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
              Hỗ trợ khách hàng
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              {col2Menus.map((item) => {
                const isExternal = item.openInNewTab || item.targetUrl.startsWith('http');
                if (isExternal) {
                  return (
                    <li key={item.id}>
                      <a
                        href={item.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-orange-400 transition-colors inline-block"
                      >
                        {item.title}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={item.id}>
                    <Link href={item.targetUrl} className="hover:text-orange-400 transition-colors inline-block">
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Cột 4: Liên hệ, Bản tin & Mạng xã hội */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Liên hệ &amp; Kết nối
            </h3>

            {/* Menu phụ Cột 3 nếu có */}
            {col3Menus.length > 0 && (
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400 mb-3">
                {col3Menus.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.targetUrl}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="hover:text-orange-400 transition-colors"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Hotline & Email */}
            <div className="space-y-2 text-xs text-slate-300 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-800">
              <p className="flex items-center gap-2">
                <span className="text-orange-400 font-bold">📞 Hotline:</span>
                <a href={`tel:${hotline || storePhone}`} className="text-white font-bold hover:text-orange-400 transition-colors">
                  {hotline || storePhone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-orange-400 font-bold">✉️ Email:</span>
                <a href={`mailto:${storeEmail}`} className="text-slate-300 hover:text-white transition-colors truncate">
                  {storeEmail}
                </a>
              </p>
            </div>

            {/* Social Icons */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Mạng xã hội:</p>
              <div className="flex items-center gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-orange-600 hover:text-white flex items-center justify-center text-xs font-bold text-slate-300 transition-all shadow-sm"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chân trang Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-500">
          <p>{copyrightText}</p>
          <p className="text-[11px] text-slate-600">
            Powered by TechBite E-Commerce Enterprise Platform
          </p>
        </div>
      </div>
    </footer>
  );
};
