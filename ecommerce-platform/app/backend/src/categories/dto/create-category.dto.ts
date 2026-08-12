import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên chuyên mục không được để trống' })
  @MaxLength(100, { message: 'Tên chuyên mục tối đa 100 ký tự' })
  name: string;

  /**
   * Nếu để trống, hệ thống tự động sinh slug từ name.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Slug tối đa 100 ký tự' })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'URL icon tối đa 500 ký tự' })
  iconUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive({ message: 'parentId phải là số nguyên dương' })
  parentId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number = 0;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isActive?: boolean = true;
}
