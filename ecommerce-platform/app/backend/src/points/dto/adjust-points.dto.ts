import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustPointsDto {
  @IsInt({ message: 'User ID phải là số nguyên' })
  @Type(() => Number)
  userId: number;

  @IsInt({ message: 'Số điểm điều chỉnh phải là số nguyên' })
  @Type(() => Number)
  points: number; // có thể dương (+) hoặc âm (-)

  @IsString()
  @IsNotEmpty({ message: 'Lý do điều chỉnh không được để trống' })
  @MinLength(5, { message: 'Lý do điều chỉnh tối thiểu 5 ký tự' })
  reason: string;
}
