import { IsEnum, IsOptional } from 'class-validator';
import { BannerCategory, BannerPosition, BannerType } from '@prisma/client';

export class GetBannersDto {
  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;

  @IsOptional()
  @IsEnum(BannerCategory)
  category?: BannerCategory;

  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;
}
