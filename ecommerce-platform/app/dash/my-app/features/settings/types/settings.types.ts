export type SettingsTab = 'general' | 'payment' | 'shipping' | 'banners' | 'menus' | 'seo';

export type BannerCategory = 'HOME' | 'PRODUCT';

export type BannerPosition = 'HERO_BANNER' | 'PROMOTION_BANNER' | 'POPUP_BANNER';

export type MenuLocation = 'HEADER' | 'FOOTER_COL1' | 'FOOTER_COL2' | 'FOOTER_COL3';

export interface GeneralSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  copyrightText: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export interface PaymentSettings {
  bankName: string;
  bankAccountNo: string;
  bankAccountHolder: string;
  vietQrTemplate: 'compact' | 'qr_only' | 'print';
  enableCod: boolean;
  paymentNote?: string;
}

export interface ShippingSettings {
  defaultShippingFee: number;
  freeShippingThreshold: number;
  estimatedDeliveryTime: string;
}

export interface BannerSettingItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetUrl?: string;
  category: BannerCategory; // 'HOME' | 'PRODUCT'
  position: BannerPosition;
  order: number;
  isActive: boolean;
}

export interface MenuSettingItem {
  id: string;
  title: string;
  targetUrl: string;
  location: MenuLocation;
  icon?: string;
  order: number;
  openInNewTab: boolean;
  isActive: boolean;
}

export interface SeoSocialSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  facebookUrl?: string;
  zaloUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

export interface SystemSettingsPayload {
  general: GeneralSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  banners: BannerSettingItem[];
  menus: MenuSettingItem[];
  seo: SeoSocialSettings;
}
