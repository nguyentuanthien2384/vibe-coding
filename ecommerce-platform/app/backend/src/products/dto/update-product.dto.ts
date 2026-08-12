import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên sản phẩm tối đa 255 ký tự' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Slug phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Slug tối đa 255 ký tự' })
  slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID danh mục phải là số nguyên' })
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @Min(0, { message: 'Giá sản phẩm không được âm' })
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá khuyến mãi phải là số' })
  @Min(0, { message: 'Giá khuyến mãi không được âm' })
  salePrice?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng tồn kho phải là số nguyên' })
  @Min(0, { message: 'Số lượng tồn kho không được âm' })
  stock?: number;

  @IsOptional()
  @IsString({ message: 'URL hình ảnh phải là chuỗi' })
  @MaxLength(500, { message: 'URL hình ảnh tối đa 500 ký tự' })
  imageUrl?: string;

  @IsOptional()
  @IsArray({ message: 'Thư viện hình ảnh phải là mảng' })
  images?: Array<{ url: string; position?: number }> | string[] | null;

  @IsOptional()
  @IsBoolean({ message: 'isFeatured phải là kiểu boolean' })
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isActive phải là kiểu boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsObject({ message: 'Mô tả ngắn phải là JSON Object' })
  shortDescription?: Record<string, any> | null;

  @IsOptional()
  @IsObject({ message: 'Mô tả chi tiết phải là JSON Object' })
  longDescription?: Record<string, any> | null;
}
