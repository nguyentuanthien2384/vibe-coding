'use client';

import { create } from 'zustand';
import { AdminUser } from '../types/admin-user.types';

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
    set({ user: null, isAuthenticated: false });
  },
}));
