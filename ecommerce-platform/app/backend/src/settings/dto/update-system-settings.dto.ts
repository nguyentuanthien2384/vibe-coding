import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GeneralSettingsDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên cửa hàng không được để trống' })
  storeName: string;

  @IsString()
  @IsNotEmpty({ message: 'Email liên hệ không được để trống' })
  storeEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  storePhone: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  storeAddress: string;

  @IsString()
  copyrightText: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  faviconUrl?: string;
}

export class PaymentSettingsDto {
  @IsString()
  bankName: string;

  @IsString()
  bankAccountNo: string;

  @IsString()
  bankAccountHolder: string;

  @IsString()
  vietQrTemplate: string;

  @IsBoolean()
  enableCod: boolean;

  @IsOptional()
  @IsString()
  paymentNote?: string;
}

export class ShippingSettingsDto {
  @IsNumber()
  defaultShippingFee: number;

  @IsNumber()
  freeShippingThreshold: number;

  @IsString()
  estimatedDeliveryTime: string;
}

export class MenuItemSettingDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  targetUrl: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsNumber()
  order: number;

  @IsBoolean()
  openInNewTab: boolean;

  @IsBoolean()
  isActive: boolean;
}

export class SeoSocialSettingsDto {
  @IsString()
  metaTitle: string;

  @IsString()
  metaDescription: string;

  @IsString()
  metaKeywords: string;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  zaloUrl?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  tiktokUrl?: string;
}

export class UpdateSystemSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  general?: GeneralSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentSettingsDto)
  payment?: PaymentSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingSettingsDto)
  shipping?: ShippingSettingsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemSettingDto)
  menus?: MenuItemSettingDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoSocialSettingsDto)
  seo?: SeoSocialSettingsDto;
}
