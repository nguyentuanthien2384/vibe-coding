import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã giao dịch ngân hàng không được để trống' })
  transactionId: string;

  @IsNumber({}, { message: 'Số tiền chuyển khoản phải là số' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung chuyển khoản không được để trống' })
  transferContent: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  transactionDate?: string;
}
