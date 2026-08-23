import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { CustomerAccountStatus } from './update-customer-status.dto';

export class UpdateCustomerDto {
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
}

