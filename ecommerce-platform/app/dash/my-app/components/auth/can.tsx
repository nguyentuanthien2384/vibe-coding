'use client';
import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface CanProps {
  permission?: string;
  permissions?: string[];
  roles?: Array<'ADMIN' | 'STAFF'>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function Can({
  permission,
  permissions,
  roles,
  children,
  fallback = null,
}: CanProps) {
  const { isAdmin, role, hasPermission, hasAnyPermission } = usePermissions();

  if (roles && role && !roles.includes(role)) {
    return <>{fallback}</>;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (permissions && permissions.length > 0 && !hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
