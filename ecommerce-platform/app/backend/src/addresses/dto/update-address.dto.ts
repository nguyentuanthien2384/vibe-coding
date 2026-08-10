import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,11}$/, { message: 'Số điện thoại không hợp lệ (9-11 chữ số)' })
  phone?: string;

  @IsOptional()
  @IsString()
  provinceCode?: string;

  @IsOptional()
  @IsString()
  provinceName?: string;

  @IsOptional()
  @IsString()
  districtCode?: string;

  @IsOptional()
  @IsString()
  districtName?: string;

  @IsOptional()
  @IsString()
  wardCode?: string;

  @IsOptional()
  @IsString()
  wardName?: string;

  @IsOptional()
  @IsString()
  detailAddress?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
