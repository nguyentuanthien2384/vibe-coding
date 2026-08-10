import { IsArray, IsInt, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MergeCartItemDto {
  @Type(() => Number)
  @IsInt({ message: 'productId phải là số nguyên' })
  @Min(1, { message: 'productId không hợp lệ' })
  productId: number;

  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(99, { message: 'Số lượng tối đa là 99' })
  quantity: number;
}

export class MergeCartDto {
  @IsArray({ message: 'items phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => MergeCartItemDto)
  items: MergeCartItemDto[];
}
