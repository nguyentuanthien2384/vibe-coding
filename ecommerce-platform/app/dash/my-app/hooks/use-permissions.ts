import { useAdminAuthStore } from '@/store/admin-auth.store';

export function usePermissions() {
  const user = useAdminAuthStore((s) => s.user);
  const role = user?.role;
  const permissions = user?.permissions || [];

  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF';

  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true;
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    if (isAdmin) return true;
    if (permissions.includes('*')) return true;
    return perms.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    if (isAdmin) return true;
    if (permissions.includes('*')) return true;
    return perms.every((p) => permissions.includes(p));
  };

  return {
    user,
    role,
    permissions,
    isAdmin,
    isStaff,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
