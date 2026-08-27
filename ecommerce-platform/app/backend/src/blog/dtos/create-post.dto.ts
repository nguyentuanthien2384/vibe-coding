import { PostStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Tiêu đề bài viết không được để trống' })
  @IsString({ message: 'Tiêu đề bài viết phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tiêu đề tối đa 255 ký tự' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Slug phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Slug tối đa 255 ký tự' })
  slug?: string;

  @IsNotEmpty({ message: 'Tóm tắt bài viết không được để trống' })
  @IsString({ message: 'Tóm tắt phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Tóm tắt tối đa 500 ký tự' })
  summary: string;

  @IsNotEmpty({ message: 'Ảnh đại diện thumbnail không được để trống' })
  @IsString({ message: 'Thumbnail phải là đường dẫn chuỗi hợp lệ' })
  @MaxLength(500, { message: 'Đường dẫn thumbnail tối đa 500 ký tự' })
  thumbnail: string;

  @IsNotEmpty({ message: 'Nội dung bài viết không được để trống' })
  @IsObject({ message: 'Nội dung TipTap content phải là Object JSON' })
  content: Record<string, unknown>;

  @IsEnum(PostStatus, { message: 'Trạng thái bài viết không hợp lệ' })
  status: PostStatus;

  @IsNotEmpty({ message: 'Chuyên mục bài viết không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'categoryId phải là số nguyên' })
  @Min(1, { message: 'categoryId không hợp lệ' })
  categoryId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readTimeMinutes?: number;

  @IsOptional()
  @IsArray({ message: 'tagIds phải là một mảng' })
  @IsInt({ each: true, message: 'Mỗi tagId phải là số nguyên' })
  tagIds?: number[];

  @IsOptional()
  @IsArray({ message: 'productIds phải là một mảng' })
  @IsInt({ each: true, message: 'Mỗi productId phải là số nguyên' })
  productIds?: number[];

  @IsOptional()
  @IsDateString({}, { message: 'scheduledAt phải là định dạng ISO DateTime' })
  scheduledAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImage?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  canonicalUrl?: string | null;
}
