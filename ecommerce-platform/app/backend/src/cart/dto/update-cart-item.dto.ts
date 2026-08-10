import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(99, { message: 'Số lượng tối đa là 99' })
  quantity: number;
}
