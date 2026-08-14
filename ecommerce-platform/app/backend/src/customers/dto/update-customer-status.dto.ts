import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum CustomerAccountStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  INACTIVE = 'INACTIVE',
}

export class UpdateCustomerStatusDto {
  @IsEnum(CustomerAccountStatus)
  @IsNotEmpty()
  status: CustomerAccountStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
