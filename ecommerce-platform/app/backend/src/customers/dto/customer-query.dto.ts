import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum CustomerTypeFilter {
  ALL = 'ALL',
  REGISTERED = 'REGISTERED',
  GUEST = 'GUEST',
}

export enum CustomerStatusFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  INACTIVE = 'INACTIVE',
}

export enum CustomerSortBy {
  CREATED_AT_DESC = 'createdAt_desc',
  CREATED_AT_ASC = 'createdAt_asc',
  TOTAL_SPENT_DESC = 'totalSpent_desc',
  TOTAL_ORDERS_DESC = 'totalOrders_desc',
  NAME_ASC = 'name_asc',
}

export class CustomerQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(CustomerTypeFilter)
  type?: CustomerTypeFilter = CustomerTypeFilter.ALL;

  @IsOptional()
  @IsEnum(CustomerStatusFilter)
  status?: CustomerStatusFilter = CustomerStatusFilter.ALL;

  @IsOptional()
  @IsEnum(CustomerSortBy)
  sortBy?: CustomerSortBy = CustomerSortBy.CREATED_AT_DESC;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
