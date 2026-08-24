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
  vietQrTemplate: string;
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

export interface MenuItemSetting {
  id: string;
  title: string;
  targetUrl: string;
  location: string;
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

export interface EmailSettings {
  mailDriver?: string;
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: string;
  smtpUser: string;
  smtpPassword?: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  adminAlertEmail?: string;
  enableOrderAlertAdmin?: boolean;
  enableWelcomeMail?: boolean;
}

/** Response email: không bao giờ trả về smtpPassword thô */
export interface EmailSettingsResponse extends Omit<EmailSettings, 'smtpPassword'> {
  hasPasswordConfigured: boolean;
}

export interface SystemSettingsPayload {
  general: GeneralSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  banners?: unknown[];
  menus: MenuItemSetting[];
  seo: SeoSocialSettings;
  email?: EmailSettingsResponse;
}

export interface SettingsResponse {
  statusCode: number;
  message: string;
  data: SystemSettingsPayload;
}

export interface PublicSettingsResponse {
  statusCode: number;
  message: string;
  data: Partial<SystemSettingsPayload>;
}
