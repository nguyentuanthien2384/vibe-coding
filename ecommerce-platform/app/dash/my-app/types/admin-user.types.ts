export type AdminRole = 'ADMIN' | 'STAFF';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: AdminRole;
  roleGroupId?: number | null;
  roleGroupName?: string;
  permissions?: string[];
}
