import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchSuggestQueryDto {
  @IsNotEmpty({ message: 'Từ khóa tìm kiếm không được để trống' })
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  @MinLength(2, { message: 'Từ khóa tìm kiếm phải có tối thiểu 2 ký tự' })
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng gợi ý phải là số nguyên' })
  @Min(1, { message: 'Số lượng gợi ý tối thiểu là 1' })
  @Max(10, { message: 'Số lượng gợi ý tối đa là 10' })
  limit?: number = 5;
}
