export type SettingsTab = 'general' | 'payment' | 'shipping' | 'banners' | 'menus' | 'seo' | 'email' | 'points';

export type BannerCategory = 'HOME' | 'PRODUCT';

export type BannerPosition = 'HERO_BANNER' | 'PROMOTION_BANNER' | 'POPUP_BANNER';

export type MenuLocation = 'HEADER' | 'FOOTER_COL1' | 'FOOTER_COL2' | 'FOOTER_COL3' | 'MOBILE';

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
  bankId?: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountHolder: string;
  vietQrTemplate: 'compact' | 'compact2' | 'qr_only' | 'print' | string;
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
  category: BannerCategory;
  position: BannerPosition;
  order: number;
  isActive: boolean;
}

export interface SubMenuSettingItem {
  id: string;
  title: string;
  targetUrl: string;
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
  children?: SubMenuSettingItem[];
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

export type SmtpEncryption = 'none' | 'ssl' | 'tls';

export interface EmailSettings {
  mailDriver?: string;
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: SmtpEncryption;
  smtpUser: string;
  /** smtpPassword không bao giờ được trả về từ API. Chỉ dùng khi admin nhập để gửi lên */
  smtpPassword?: string;
  /** Cờ backend trả về cho biết đã thiết lập mật khẩu chưa */
  hasPasswordConfigured?: boolean;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  adminAlertEmail?: string;
  enableOrderAlertAdmin?: boolean;
  enableWelcomeMail?: boolean;
}

export interface PointsConfig {
  earnRatePercentage: number;
  redeemRateVnd: number;
  minPointsToRedeem: number;
  maxRedeemPercentage: number;
  pointsExpiryDays: number;
  tierMultipliers: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    DIAMOND: number;
  };
  tierThresholds: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    DIAMOND: number;
  };
}

export interface SystemSettingsPayload {
  general: GeneralSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  banners: BannerSettingItem[];
  menus: MenuSettingItem[];
  seo: SeoSocialSettings;
  email?: EmailSettings;
  points?: PointsConfig;
}
