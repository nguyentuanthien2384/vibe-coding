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
  vietQrTemplate: string;
  enableCod: boolean;
  paymentNote?: string;
}

export interface ShippingSettings {
  defaultShippingFee: number;
  freeShippingThreshold: number;
  estimatedDeliveryTime: string;
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
  banners?: any[];
  menus: MenuItemSetting[];
  seo: SeoSocialSettings;
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
