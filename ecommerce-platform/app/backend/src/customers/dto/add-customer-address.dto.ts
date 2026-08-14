import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddCustomerAddressDto {
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  provinceCode?: string;

  @IsString()
  @IsNotEmpty()
  provinceName: string;

  @IsOptional()
  @IsString()
  districtCode?: string;

  @IsString()
  @IsNotEmpty()
  districtName: string;

  @IsOptional()
  @IsString()
  wardCode?: string;

  @IsString()
  @IsNotEmpty()
  wardName: string;

  @IsString()
  @IsNotEmpty()
  detailAddress: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}
