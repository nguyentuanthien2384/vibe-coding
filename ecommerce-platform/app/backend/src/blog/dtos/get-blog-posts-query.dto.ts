import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum PostSortType {
  LATEST = 'latest',
  VIEWS = 'views',
}

export class GetBlogPostsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  limit?: number = 9;

  @IsOptional()
  @IsString()
  category?: string; // slug chuyen muc

  @IsOptional()
  @IsString()
  tag?: string; // slug tag

  @IsOptional()
  @IsString()
  q?: string; // tu khoa tim kiem

  @IsOptional()
  @IsEnum(PostSortType)
  sort?: PostSortType = PostSortType.LATEST;

  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;
}
