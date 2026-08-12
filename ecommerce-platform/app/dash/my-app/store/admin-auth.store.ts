'use client';

import { create } from 'zustand';
import { AdminUser } from '../types/admin-user.types';
import { setAccessToken } from '../lib/admin-api';
import { authApi } from '../lib/auth-api';

interface AdminAuthStore {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AdminUser | null) => void;
  logout: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: async () => {
    await authApi.logout();
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },
}));
