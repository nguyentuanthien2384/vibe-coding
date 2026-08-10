import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có tối thiểu 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không vượt quá 50 ký tự' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái và một chữ số' })
  password: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  @IsString()
  confirmPassword: string;

  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString()
  @MinLength(2, { message: 'Họ và tên phải có tối thiểu 2 ký tự' })
  @MaxLength(100, { message: 'Họ và tên không vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName: string;

  @IsOptional()
  @IsString()
  @Matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;
}
