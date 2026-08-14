import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { BannerCategory, BannerPosition, BannerType } from '@prisma/client';

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitle?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

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
