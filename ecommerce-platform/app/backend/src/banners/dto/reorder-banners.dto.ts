import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderBannerItemDto {
  @IsInt()
  id: number;

  @IsInt()
  order: number;
}

export class ReorderBannersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderBannerItemDto)
  items: ReorderBannerItemDto[];
}
