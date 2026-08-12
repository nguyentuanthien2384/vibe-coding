'use client';

import { useEffect } from 'react';
import { useAdminAuthStore } from '../store/admin-auth.store';
import { authApi } from '../lib/auth-api';
import { getAccessToken } from '../lib/admin-api';

/**
 * Custom hook tự động tải thông tin người dùng thực tế từ Backend (/api/v1/auth/me) khi F5 / mở Dashboard
 */
export function useAdminAuthInit() {
  const setUser = useAdminAuthStore((s) => s.setUser);
  const logout = useAdminAuthStore((s) => s.logout);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = getAccessToken();
      if (!token) return;

      try {
        const user = await authApi.getMe();
        if (isMounted) {
          setUser(user);
        }
      } catch {
        if (isMounted) {
          await logout();
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [setUser, logout]);
}
