import { IsEnum, IsOptional } from 'class-validator';
import { BannerType } from '@prisma/client';

export class GetBannersDto {
  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;
}
