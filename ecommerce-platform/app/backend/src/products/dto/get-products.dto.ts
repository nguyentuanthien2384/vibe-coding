import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  PRICE = 'price',
  IS_FEATURED = 'isFeatured',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetProductsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value as string, 10))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(48)
  @Transform(({ value }) => parseInt(value as string, 10))
  limit?: number = 12;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value as string, 10))
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'minPrice must not be negative' })
  @Transform(({ value }) => parseFloat(value as string))
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'maxPrice must not be negative' })
  @Transform(({ value }) => parseFloat(value as string))
  maxPrice?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
