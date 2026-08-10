import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetCategoriesDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  tree?: boolean = false;
}
