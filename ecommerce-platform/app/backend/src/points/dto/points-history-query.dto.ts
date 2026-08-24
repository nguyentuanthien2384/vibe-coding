import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PointsTransactionType } from '@prisma/client';

export class PointsHistoryQueryDto {
  @IsOptional()
  @IsInt({ message: 'Trang phải là số nguyên' })
  @Min(1, { message: 'Trang tối thiểu là 1' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: 'Số lượng mỗi trang phải là số nguyên' })
  @Min(1, { message: 'Số lượng mỗi trang tối thiểu là 1' })
  @Max(100, { message: 'Số lượng mỗi trang tối đa là 100' })
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum([...Object.values(PointsTransactionType), 'ALL'], {
    message: 'Loại giao dịch điểm không hợp lệ',
  })
  type?: PointsTransactionType | 'ALL' = 'ALL';
}
