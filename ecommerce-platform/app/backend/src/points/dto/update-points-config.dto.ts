import { IsNumber, IsObject, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MembershipTier } from '@prisma/client';

export class UpdatePointsConfigDto {
  @IsOptional()
  @IsNumber({}, { message: 'Tỷ lệ tích điểm phải là số' })
  @Min(0, { message: 'Tỷ lệ tích điểm không được âm' })
  @Max(100, { message: 'Tỷ lệ tích điểm tối đa 100%' })
  @Type(() => Number)
  earnRatePercentage?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Giá trị quy đổi phải là số' })
  @Min(100, { message: 'Giá trị quy đổi tối thiểu 100 VNĐ / điểm' })
  @Type(() => Number)
  redeemRateVnd?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Số điểm đổi tối thiểu phải là số' })
  @Min(0, { message: 'Số điểm tối thiểu không được âm' })
  @Type(() => Number)
  minPointsToRedeem?: number;

  @IsOptional()
  @IsNumber({}, { message: '% tối đa giá trị đơn hàng được trừ phải là số' })
  @Min(1, { message: '% tối đa tối thiểu 1%' })
  @Max(100, { message: '% tối đa 100%' })
  @Type(() => Number)
  maxRedeemPercentage?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Hạn sử dụng điểm phải là số ngày' })
  @Min(0, { message: 'Hạn sử dụng điểm không được âm' })
  @Type(() => Number)
  pointsExpiryDays?: number;

  @IsOptional()
  @IsObject({ message: 'Hệ số nhân hạng thành viên phải là object' })
  tierMultipliers?: Record<MembershipTier, number>;

  @IsOptional()
  @IsObject({ message: 'Mốc thăng hạng thành viên phải là object' })
  tierThresholds?: Record<MembershipTier, number>;
}
