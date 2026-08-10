import { IsOptional, IsString, MaxLength, MinLength, Matches, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Họ và tên phải có tối thiểu 2 ký tự' })
  @MaxLength(100, { message: 'Họ và tên không vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, { message: 'Số điện thoại không đúng định dạng (VD: 0901234567 hoặc +84901234567)' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Link ảnh đại diện không vượt quá 500 ký tự' })
  avatarUrl?: string;
}
