import { IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu hiện tại' })
  @IsString()
  oldPassword: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu mới' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có tối thiểu 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không vượt quá 50 ký tự' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái và một chữ số' })
  newPassword: string;

  @IsNotEmpty({ message: 'Vui lòng xác nhận mật khẩu mới' })
  @IsString()
  confirmPassword: string;
}
