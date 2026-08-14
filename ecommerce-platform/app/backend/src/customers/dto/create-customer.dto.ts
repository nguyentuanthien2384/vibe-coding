import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerAddressInputDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  recipientName: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại người nhận không được để trống' })
  phone: string;

  @IsOptional()
  @IsString()
  provinceCode?: string;

  @IsString()
  @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
  provinceName: string;

  @IsOptional()
  @IsString()
  districtCode?: string;

  @IsString()
  @IsNotEmpty({ message: 'Quận/Huyện không được để trống' })
  districtName: string;

  @IsOptional()
  @IsString()
  wardCode?: string;

  @IsString()
  @IsNotEmpty({ message: 'Phường/Xã không được để trống' })
  wardName: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ cụ thể không được để trống' })
  detailAddress: string;
}

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có tối thiểu 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không vượt quá 50 ký tự' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái và một chữ số',
  })
  password?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerAddressInputDto)
  address?: CustomerAddressInputDto;
}
