import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum CategorySortBy {
  POSITION = 'position',
  NAME = 'name',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetAdminCategoriesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isActive?: boolean;

  /**
   * Lọc theo parentId. Truyền 'null' để lấy danh mục gốc, truyền số để lọc theo cha.
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null' || value === null) return null;
    const parsed = parseInt(value as string, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  parentId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(CategorySortBy)
  sortBy?: CategorySortBy = CategorySortBy.POSITION;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
