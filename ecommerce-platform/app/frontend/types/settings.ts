// types/settings.ts
// Định nghĩa kiểu dữ liệu cho Module System Settings phía Frontend

export interface GeneralSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  hotline?: string;
  storeAddress: string;
  copyrightText: string;
  logoUrl?: string;
  faviconUrl?: string;
  workingHours?: string;
  taxCode?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
}

export interface PaymentSettings {
  bankName: string;
  bankAccountNo: string;
  bankAccountHolder: string;
  vietQrTemplate: 'compact' | 'qr_only' | 'print' | string;
  enableCod: boolean;
  paymentNote?: string;
}

export interface ShippingSettings {
  defaultShippingFee: number;
  freeShippingThreshold: number;
  estimatedDeliveryTime: string;
}

export interface SubMenuItemSetting {
  id: string;
  title: string;
  targetUrl: string;
  order: number;
  isActive: boolean;
}

export type MenuLocation = 'HEADER' | 'FOOTER_COL1' | 'FOOTER_COL2' | 'FOOTER_COL3' | 'MOBILE' | string;

export interface MenuItemSetting {
  id: string;
  title: string;
  targetUrl: string;
  location: MenuLocation;
  icon?: string;
  order: number;
  openInNewTab: boolean;
  isActive: boolean;
  children?: SubMenuItemSetting[];
}

export interface SeoSocialSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl?: string;
  metaRobots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  facebookUrl?: string;
  zaloUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  googleSiteVerification?: string;
  googleAnalyticsId?: string;
  customHeadScript?: string;
  customBodyScript?: string;
}

export interface PublicSettingsData {
  general?: GeneralSettings;
  payment?: PaymentSettings;
  shipping?: ShippingSettings;
  menus?: MenuItemSetting[];
  seo?: SeoSocialSettings;
}

export interface PublicSettingsResponse {
  statusCode: number;
  message: string;
  data: PublicSettingsData;
}
