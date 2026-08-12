import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Trạng thái đơn hàng không hợp lệ' })
  orderStatus?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Trạng thái thanh toán không hợp lệ' })
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Lý do hủy không được vượt quá 500 ký tự' })
  cancelReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú admin không được vượt quá 500 ký tự' })
  adminNote?: string;
}
