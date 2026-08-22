import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateStaffStatusDto {
  @IsIn(['ACTIVE', 'BLOCKED'], { message: 'Trạng thái phải là ACTIVE hoặc BLOCKED' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status: 'ACTIVE' | 'BLOCKED';

  @IsString()
  @IsOptional()
  reason?: string;
}
