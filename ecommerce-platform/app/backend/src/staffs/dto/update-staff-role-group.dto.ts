import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateStaffRoleGroupDto {
  @IsEnum(Role, { message: 'Vai trò chỉ được là ADMIN hoặc STAFF' })
  @IsOptional()
  role?: Role;

  @IsInt({ message: 'ID nhóm quyền phải là số nguyên' })
  @IsOptional()
  roleGroupId?: number | null;
}
