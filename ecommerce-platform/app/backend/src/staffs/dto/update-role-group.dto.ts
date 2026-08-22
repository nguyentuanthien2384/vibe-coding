import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRoleGroupDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Tên nhóm quyền tối đa 100 ký tự' })
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray({ message: 'Danh sách quyền hạn phải là mảng string' })
  @IsString({ each: true, message: 'Mỗi quyền hạn phải là chuỗi định danh' })
  @IsOptional()
  permissions?: string[];
}
