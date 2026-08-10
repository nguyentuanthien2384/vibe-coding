import { create } from "zustand";
import { UserProfile } from "../types/auth.types";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
  setAuthenticated: (status: boolean) => void;
  logout: () => void;
}

/**
 * Zustand store chỉ lưu trạng thái cờ đăng nhập và user info tạm thời trên RAM,
 * TUYỆT ĐỐI KHÔNG lưu thông tin user hay token vào LocalStorage.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

