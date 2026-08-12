/**
 * API client hỗ trợ lấy thông tin tài khoản Admin và Đăng xuất
 */

import { adminFetch } from './admin-api';
import { AdminUser } from '../types/admin-user.types';

export interface MeApiResponse {
  statusCode: number;
  message: string;
  data: {
    id: number | string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  };
}

export const authApi = {
  /**
   * GET /api/v1/auth/me
   * Lấy thông tin tài khoản người dùng đang đăng nhập
   */
  getMe: async (): Promise<AdminUser> => {
    const res = await adminFetch<MeApiResponse>('/auth/me');
    const userData = res.data;
    return {
      id: String(userData.id),
      fullName: userData.fullName || 'Admin User',
      email: userData.email,
      avatarUrl: userData.avatarUrl,
      role: (userData.role === 'ADMIN' ? 'ADMIN' : 'STAFF') as 'ADMIN' | 'STAFF',
    };
  },

  /**
   * POST /api/v1/auth/logout
   * Đăng xuất khỏi backend (đưa token vào blacklist & xóa cookie)
   */
  logout: async (): Promise<void> => {
    try {
      await adminFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Bỏ qua lỗi nếu token đã hết hạn trước đó
    }
  },
};
