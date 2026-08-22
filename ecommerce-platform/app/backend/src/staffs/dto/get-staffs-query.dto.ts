import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Role } from '@prisma/client';

export class GetStaffsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  status?: 'ACTIVE' | 'BLOCKED' | 'ALL' = 'ALL';

  @IsString()
  @IsOptional()
  role?: 'ADMIN' | 'STAFF' | 'ALL' = 'ALL';

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  roleGroupId?: number;
}
