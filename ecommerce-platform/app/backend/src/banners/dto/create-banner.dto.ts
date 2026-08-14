import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { BannerCategory, BannerPosition, BannerType } from '@prisma/client';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề banner không được để trống' })
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitle?: string;

  @IsString()
  @IsNotEmpty({ message: 'Hình ảnh banner không được để trống' })
  imageUrl: string;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsOptional()
  @IsEnum(BannerCategory)
  category?: BannerCategory;

  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
