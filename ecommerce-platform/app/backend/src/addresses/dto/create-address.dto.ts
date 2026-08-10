import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ tên người nhận không được để trống' })
  recipientName: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại người nhận không được để trống' })
  @Matches(/^[0-9]{9,11}$/, { message: 'Số điện thoại không hợp lệ (9-11 chữ số)' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã tỉnh/thành phố không được để trống' })
  provinceCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên tỉnh/thành phố không được để trống' })
  provinceName: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã quận/huyện không được để trống' })
  districtCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên quận/huyện không được để trống' })
  districtName: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã phường/xã không được để trống' })
  wardCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên phường/xã không được để trống' })
  wardName: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ cụ thể không được để trống' })
  detailAddress: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
