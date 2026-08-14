import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BannerCategory, BannerPosition } from '@prisma/client';

export class GetBannersAdminDto {
  @IsOptional()
  @IsEnum(BannerCategory)
  category?: BannerCategory;

  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @IsOptional()
  @IsString()
  search?: string;
}
