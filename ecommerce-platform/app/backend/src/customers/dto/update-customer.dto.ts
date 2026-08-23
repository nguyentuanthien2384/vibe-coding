import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { CustomerAccountStatus } from './update-customer-status.dto';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  type?: 'REGISTERED' | 'GUEST';

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(CustomerAccountStatus)
  status?: CustomerAccountStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có tối thiểu 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không vượt quá 50 ký tự' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái và một chữ số',
  })
  password?: string;
}

