export type StaffRole = 'ADMIN' | 'STAFF';

export type StaffStatus = 'ACTIVE' | 'BLOCKED';

export type PermissionCategory = 'PRODUCT' | 'ORDER' | 'CUSTOMER' | 'SYSTEM';

export interface PermissionDefinition {
  id: string;
  label: string;
  category: PermissionCategory;
}

export interface StaffRoleGroup {
  id: number | string;
  name: string;
  slug?: string;
  description: string | null;
  memberCount: number;
  isSystem: boolean;
  permissions: string[];
}

export interface StaffListItem {
  id: string;
  numericId: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: StaffRole;
  roleLabel: string;
  roleGroupId?: number | string | null;
  roleGroupName?: string;
  status: StaffStatus;
  createdAt: string;
  lastLoginAt?: string;
  inheritedPermissions: string[];
  customPermissions: string[];
  notes?: string;
}

export interface StaffDetail extends StaffListItem {
  notes?: string;
  effectivePermissions?: string[];
}

export interface CreateStaffInput {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  roleGroupId?: number | string | null;
  role: StaffRole;
  notes?: string;
}

export interface UpdateStaffStatusInput {
  staffId: string;
  status: StaffStatus;
  reason?: string;
}

export interface UpdateStaffCustomPermissionsInput {
  staffId: string;
  customPermissions: string[];
}

export interface UpdateStaffRoleInput {
  staffId: string;
  role: StaffRole;
  roleGroupId?: number | string | null;
}


export interface UpdateStaffBasicInfoInput {
  fullName?: string;
  phone?: string;
  notes?: string;
}

export interface CreateRoleGroupInput {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleGroupInput {
  id: number | string;
  name: string;
  description?: string;
  permissions: string[];
}

