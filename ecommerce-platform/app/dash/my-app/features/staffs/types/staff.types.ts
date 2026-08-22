export type StaffRole = 'ADMIN' | 'STAFF';

export type StaffStatus = 'ACTIVE' | 'BLOCKED';

export type PermissionCategory = 'PRODUCT' | 'ORDER' | 'CUSTOMER' | 'SYSTEM';

export interface PermissionDefinition {
  id: string;
  label: string;
  category: PermissionCategory;
}

export interface StaffRoleGroup {
  id: string;
  name: string;
  description: string;
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
  roleGroupId?: string;
  roleGroupName?: string;
  status: StaffStatus;
  createdAt: string;
  lastLoginAt?: string;
  inheritedPermissions: string[];
  customPermissions: string[];
}

export interface StaffDetail extends StaffListItem {
  notes?: string;
}

export interface CreateStaffInput {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  roleGroupId?: string;
  role: StaffRole;
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
  roleGroupId?: number | null;
  permissions?: string[];
}

export interface CreateRoleGroupInput {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleGroupInput {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}
