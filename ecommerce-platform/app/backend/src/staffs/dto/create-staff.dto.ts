import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên nhân viên không được để trống' })
  fullName: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password?: string;

  @IsEnum(Role, { message: 'Vai trò chỉ được là ADMIN hoặc STAFF' })
  @IsOptional()
  role?: Role = Role.STAFF;

  @IsInt({ message: 'ID nhóm quyền phải là số nguyên' })
  @IsOptional()
  roleGroupId?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
