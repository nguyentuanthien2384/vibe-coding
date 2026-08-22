import { Role } from '@prisma/client';

export interface StaffListItemDto {
  id: string;
  numericId: number;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  roleLabel: string;
  roleGroupId: number | null;
  roleGroupName: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  lastLoginAt: Date | null;
}

export interface StaffDetailDto extends StaffListItemDto {
  inheritedPermissions: string[];
  customPermissions: string[];
  effectivePermissions: string[];
  notes: string | null;
}

export interface StaffListResponse {
  success: boolean;
  statusCode: number;
  data: {
    staffs: StaffListItemDto[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface StaffDetailResponse {
  success: boolean;
  statusCode: number;
  data: StaffDetailDto;
}

export interface StaffMutateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: StaffDetailDto;
}
