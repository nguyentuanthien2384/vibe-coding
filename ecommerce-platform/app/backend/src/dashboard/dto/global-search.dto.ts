import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class GlobalSearchQueryDto {
  @IsString()
  @MinLength(1, { message: 'Từ khóa tìm kiếm không được để trống' })
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 5;
}
