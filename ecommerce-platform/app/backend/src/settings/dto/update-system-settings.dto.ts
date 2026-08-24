import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GeneralSettingsDto } from './general-settings.dto';
import { MenuItemSettingDto } from './menu-settings.dto';
import { SeoSocialSettingsDto } from './seo-settings.dto';
import { EmailSettingsDto } from './email-settings.dto';

// Re-export for backward compatibility
export { GeneralSettingsDto } from './general-settings.dto';
export { MenuItemSettingDto } from './menu-settings.dto';
export { SeoSocialSettingsDto } from './seo-settings.dto';
export { EmailSettingsDto } from './email-settings.dto';

export class PaymentSettingsDto {
  @IsOptional()
  bankId?: string;

  @IsOptional()
  bankName?: string;

  @IsOptional()
  bankAccountNo?: string;

  @IsOptional()
  bankAccountHolder?: string;

  @IsOptional()
  vietQrTemplate?: string;

  @IsOptional()
  enableCod?: boolean;

  @IsOptional()
  paymentNote?: string;
}

export class ShippingSettingsDto {
  @IsOptional()
  defaultShippingFee?: number;

  @IsOptional()
  freeShippingThreshold?: number;

  @IsOptional()
  estimatedDeliveryTime?: string;
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

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailSettingsDto)
  email?: EmailSettingsDto;
}
