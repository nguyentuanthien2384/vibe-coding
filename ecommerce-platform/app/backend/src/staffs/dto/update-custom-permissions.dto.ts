import { IsArray, IsString } from 'class-validator';

export class UpdateCustomPermissionsDto {
  @IsArray({ message: 'Danh sách đặc quyền phải là mảng chuỗi' })
  @IsString({ each: true, message: 'Mỗi quyền hạn phải là chuỗi định danh' })
  customPermissions: string[];
}
