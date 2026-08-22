import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MenuLocation {
  HEADER = 'HEADER',
  FOOTER_COL1 = 'FOOTER_COL1',
  FOOTER_COL2 = 'FOOTER_COL2',
  FOOTER_COL3 = 'FOOTER_COL3',
  MOBILE = 'MOBILE',
}

export class SubMenuItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề menu con không được để trống' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Đường dẫn liên kết không được để trống' })
  targetUrl: string;

  @IsInt()
  order: number;

  @IsBoolean()
  isActive: boolean;
}

export class MenuItemSettingDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề menu không được để trống' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Đường dẫn liên kết không được để trống' })
  targetUrl: string;

  @IsEnum(MenuLocation, { message: 'Vị trí menu không hợp lệ' })
  location: MenuLocation;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsInt()
  order: number;

  @IsBoolean()
  openInNewTab: boolean;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubMenuItemDto)
  children?: SubMenuItemDto[];
}
