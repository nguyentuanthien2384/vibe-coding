import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EmailType, EmailStatus } from '@prisma/client';

export class EmailLogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(EmailType, { message: 'Loại email không hợp lệ' })
  type?: EmailType;

  @IsOptional()
  @IsEnum(EmailStatus, { message: 'Trạng thái email không hợp lệ' })
  status?: EmailStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
