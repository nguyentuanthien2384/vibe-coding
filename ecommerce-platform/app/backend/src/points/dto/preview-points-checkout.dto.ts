import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PreviewPointsCheckoutDto {
  @IsInt({ message: 'Số điểm sử dụng phải là số nguyên' })
  @Min(0, { message: 'Số điểm sử dụng không được âm' })
  @Type(() => Number)
  pointsToUse: number;

  @IsOptional()
  @IsString()
  voucherCode?: string;
}
