import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ApplyVoucherDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã giảm giá' })
  @Transform(({ value }: { value: string }) => value?.trim().toUpperCase())
  code: string;

  @IsNumber({}, { message: 'Tạm tính phải là số' })
  @Min(0, { message: 'Tạm tính không thể nhỏ hơn 0' })
  subtotal: number;
}
