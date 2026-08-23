export type AdminRole = 'ADMIN' | 'STAFF';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl: string | null;
  role: AdminRole;
  roleGroupId?: number | null;
  roleGroupName?: string;
  permissions?: string[];
}

