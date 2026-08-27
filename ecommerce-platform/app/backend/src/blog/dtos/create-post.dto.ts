import { PostStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Tieu de khong duoc de trong' })
  @MaxLength(255, { message: 'Tieu de toi da 255 ky tu' })
  title: string;

  @IsString({ message: 'Slug khong duoc de trong' })
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug khong dung dinh dang kebab-case',
  })
  slug: string;

  @IsString({ message: 'Tom tat bai viet khong duoc de trong' })
  @MaxLength(500)
  summary: string;

  @IsUrl({}, { message: 'Thumbnail phai la URL hop le' })
  thumbnail: string;

  @IsObject({ message: 'Noi dung TipTap content phai la Object JSON' })
  content: Record<string, unknown>;

  @IsEnum(PostStatus, { message: 'Trang thai bai viet khong hop le' })
  status: PostStatus;

  @IsInt({ message: 'categoryId phai la so nguyen' })
  @Min(1)
  @Type(() => Number)
  categoryId: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  productIds?: number[];

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;
}
