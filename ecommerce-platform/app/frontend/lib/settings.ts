// lib/settings.ts
// Data fetcher cho Module Settings phía Frontend Storefront

import { apiFetch, ApiResponse } from './api';
import {
  GeneralSettings,
  MenuItemSetting,
  PublicSettingsData,
  SeoSocialSettings,
} from '../types/settings';

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  storeName: 'TechBite',
  storeEmail: 'contact@techbite.vn',
  storePhone: '1900 6868',
  hotline: '0988 123 456',
  storeAddress: 'Tầng 12, Tòa nhà Innovation Tower, Cầu Giấy, Hà Nội',
  copyrightText: '© 2026 TechBite E-Commerce Platform. Tất cả quyền được bảo lưu.',
  logoUrl: '',
  faviconUrl: '/favicon.ico',
  workingHours: '08:00 - 22:00 (Thứ 2 - Chủ Nhật)',
  taxCode: '0109988776',
  maintenanceMode: false,
  maintenanceMessage: 'Hệ thống đang bảo trì nâng cấp định kỳ. Vui lòng quay lại sau ít phút!',
};

export const DEFAULT_MENUS: MenuItemSetting[] = [
  {
    id: 'menu-default-1',
    title: 'Trang chủ',
    targetUrl: '/',
    location: 'HEADER',
    icon: '🏠',
    order: 1,
    openInNewTab: false,
    isActive: true,
  },
  {
    id: 'menu-default-2',
    title: 'Thực đơn',
    targetUrl: '/products',
    location: 'HEADER',
    icon: '🍱',
    order: 2,
    openInNewTab: false,
    isActive: true,
  },
  {
    id: 'menu-default-3',
    title: 'Combo Deadline 💻',
    targetUrl: '/categories/combo-deadline',
    location: 'HEADER',
    icon: '💻',
    order: 3,
    openInNewTab: false,
    isActive: true,
  },
  {
    id: 'menu-default-4',
    title: 'Khuyến mãi 🔥',
    targetUrl: '/products?onSale=true',
    location: 'HEADER',
    icon: '🔥',
    order: 4,
    openInNewTab: false,
    isActive: true,
  },
  // Footer Col 1
  {
    id: 'menu-footer-1',
    title: '🍟 Đồ ăn vặt đêm',
    targetUrl: '/categories/do-an-vat',
    location: 'FOOTER_COL1',
    order: 1,
    openInNewTab: false,
    isActive: true,
  },
  {
    id: 'menu-footer-2',
    title: '🧃 Nước tăng lực & Cà phê',
    targetUrl: '/categories/nuoc-uong',
    location: 'FOOTER_COL1',
    order: 2,
    openInNewTab: false,
    isActive: true,
  },
  {
    id: 'menu-footer-3',
    title: '💻 Combo Chạy Deadline',
    targetUrl: '/categories/combo-deadline',
    location: 'FOOTER_COL1',
    order: 3,
    openInNewTab: false,
    isActive: true,
  },
  {
    id: 'menu-footer-4',
    title: '🔥 Ưu đãi Hot hôm nay',
    targetUrl: '/products',
    location: 'FOOTER_COL1',
    order: 4,
    openInNewTab: false,
    isActive: true,
  },
  // Footer Col 2
  {
    id: 'menu-footer-5',
    title: 'Chính sách giao hàng 15p',
    targetUrl: '/policy/shipping',
    location: 'FOOTER_COL2',
    order: 1,
    openInNewTab: false,
    isActive: true,
  },
  {
    id: 'menu-footer-6',
    title: 'Chính sách đổi trả & Hoàn tiền',
    targetUrl: '/policy/return',
    location: 'FOOTER_COL2',
    order: 2,
    openInNewTab: false,
    isActive: true,
  },
  {
    id: 'menu-footer-7',
    title: 'Câu hỏi thường gặp (FAQ)',
    targetUrl: '/faq',
    location: 'FOOTER_COL2',
    order: 3,
    openInNewTab: false,
    isActive: true,
  },
  {
    id: 'menu-footer-8',
    title: 'Liên hệ Hotline 24/7',
    targetUrl: '/contact',
    location: 'FOOTER_COL2',
    order: 4,
    openInNewTab: false,
    isActive: true,
  },
];

export const DEFAULT_SEO: SeoSocialSettings = {
  metaTitle: 'TechBite - Sàn Thương Mại Điện Tử & Nạp Năng Lượng Lập Trình Viên',
  metaDescription: 'Combo Thức Khuya giảm giá 20% — Chỉ dành cho anh em chạy deadline. Giao nhanh 15 phút, giải cứu mọi deadline.',
  metaKeywords: 'TechBite, E-commerce, Đồ ăn vặt, Lập trình viên, FastFood, Combo deadline',
  canonicalUrl: 'https://techbite.vn',
  metaRobots: 'index, follow',
  ogTitle: 'TechBite - Nạp Năng Lượng Code Phê Hơn',
  ogDescription: 'Combo Thức Khuya giảm giá 20% — Chỉ dành cho anh em chạy deadline.',
  ogImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1400&h=500',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  facebookUrl: 'https://facebook.com',
  zaloUrl: 'https://zalo.me',
  instagramUrl: 'https://instagram.com',
  tiktokUrl: 'https://tiktok.com',
  youtubeUrl: 'https://youtube.com',
};

/**
 * Lấy toàn bộ cấu hình công khai (General, Menus, SEO, Payment, Shipping)
 * Cache 60s (ISR)
 */
export async function getPublicSettings(): Promise<{
  settings: PublicSettingsData;
  general: GeneralSettings;
  menus: MenuItemSetting[];
  seo: SeoSocialSettings;
  isError: boolean;
}> {
  try {
    const res = await apiFetch<ApiResponse<PublicSettingsData>>('/api/v1/settings/public', {
      next: { revalidate: 60 },
    });

    const data = res?.data ?? {};
    const general: GeneralSettings = {
      ...DEFAULT_GENERAL_SETTINGS,
      ...(data.general ?? {}),
    };

    const rawMenus = Array.isArray(data.menus) && data.menus.length > 0 ? data.menus : DEFAULT_MENUS;
    const menus = rawMenus.filter((m) => m.isActive !== false);

    const seo: SeoSocialSettings = {
      ...DEFAULT_SEO,
      ...(data.seo ?? {}),
    };

    return {
      settings: data,
      general,
      menus,
      seo,
      isError: false,
    };
  } catch (error) {
    console.warn('[getPublicSettings] Không thể kết nối API settings backend, sử dụng default fallback:', error);
    return {
      settings: {
        general: DEFAULT_GENERAL_SETTINGS,
        menus: DEFAULT_MENUS,
        seo: DEFAULT_SEO,
      },
      general: DEFAULT_GENERAL_SETTINGS,
      menus: DEFAULT_MENUS,
      seo: DEFAULT_SEO,
      isError: true,
    };
  }
}

/**
 * Lấy danh sách Navigation Menus đang kích hoạt
 */
export async function getPublicMenus(): Promise<MenuItemSetting[]> {
  try {
    const res = await apiFetch<ApiResponse<MenuItemSetting[]>>('/api/v1/settings/menus', {
      next: { revalidate: 60 },
    });
    if (Array.isArray(res?.data) && res.data.length > 0) {
      return res.data.filter((m) => m.isActive !== false);
    }
    return DEFAULT_MENUS;
  } catch (error) {
    console.warn('[getPublicMenus] Fallback to default menus:', error);
    return DEFAULT_MENUS;
  }
}

/**
 * Lấy cấu hình SEO cho metadata
 */
export async function getPublicSeo(): Promise<SeoSocialSettings> {
  try {
    const res = await apiFetch<ApiResponse<SeoSocialSettings>>('/api/v1/settings/seo', {
      next: { revalidate: 60 },
    });
    return {
      ...DEFAULT_SEO,
      ...(res?.data ?? {}),
    };
  } catch (error) {
    console.warn('[getPublicSeo] Fallback to default SEO:', error);
    return DEFAULT_SEO;
  }
}
