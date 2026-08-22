import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GeneralSettingsDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên cửa hàng không được để trống' })
  storeName: string;

  @IsEmail({}, { message: 'Email liên hệ không đúng định dạng' })
  @IsNotEmpty({ message: 'Email liên hệ không được để trống' })
  storeEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  storePhone: string;

  @IsOptional()
  @IsString()
  hotline?: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ cửa hàng không được để trống' })
  storeAddress: string;

  @IsString()
  copyrightText: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @IsOptional()
  @IsString()
  workingHours?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsString()
  maintenanceMessage?: string;
}
