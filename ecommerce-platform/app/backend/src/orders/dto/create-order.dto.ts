import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingMethod, PaymentMethod } from '@prisma/client';

export class CustomerInfoDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @IsString()
  @Matches(/^[0-9]{9,11}$/, { message: 'Số điện thoại không hợp lệ (9-11 chữ số)' })
  phone: string;
}

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
  provinceName: string;

  @IsString()
  @IsNotEmpty({ message: 'Quận/Huyện không được để trống' })
  districtName: string;

  @IsString()
  @IsNotEmpty({ message: 'Phường/Xã không được để trống' })
  wardName: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ cụ thể không được để trống' })
  detailAddress: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsEnum(ShippingMethod, { message: 'Phương thức vận chuyển không hợp lệ' })
  shippingMethod: ShippingMethod;

  @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsOptional()
  @IsString()
  orderNote?: string;
}
