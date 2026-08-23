import { adminFetch } from '../../../lib/admin-api';
import { uploadApi } from '../../../lib/upload-api';
import { UpdateProfileInput, ChangePasswordInput } from '../types/profile.types';
import { AdminUser } from '../../../types/admin-user.types';

export interface ProfileApiResponse {
  statusCode: number;
  message: string;
  data: {
    id: number | string;
    fullName: string;
    email: string;
    phone?: string | null;
    avatarUrl: string | null;
    role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  };
}

export const profileApi = {
  /**
   * PATCH /api/v1/auth/profile
   * Cập nhật thông tin hồ sơ cá nhân (Họ tên, SĐT, Avatar)
   */
  updateProfile: async (input: UpdateProfileInput): Promise<AdminUser> => {
    const payload: { fullName?: string; phone?: string | null; avatarUrl?: string | null } = {
      fullName: input.fullName.trim(),
      phone: input.phone !== undefined ? (input.phone.trim() || null) : undefined,
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : undefined,
    };

    const res = await adminFetch<ProfileApiResponse>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    const userData = res.data;
    return {
      id: String(userData.id),
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone || null,
      avatarUrl: userData.avatarUrl,
      role: (userData.role === 'ADMIN' ? 'ADMIN' : 'STAFF') as 'ADMIN' | 'STAFF',
    };
  },

  /**
   * PATCH /api/v1/auth/change-password
   * Đổi mật khẩu người dùng & thu hồi token cũ
   */
  changePassword: async (input: ChangePasswordInput): Promise<{ message: string }> => {
    const res = await adminFetch<{ statusCode: number; message: string }>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
        confirmPassword: input.confirmPassword,
      }),
    });

    return { message: res.message || 'Đổi mật khẩu thành công' };
  },

  /**
   * Upload avatar image file
   */
  uploadAvatar: async (file: File): Promise<string> => {
    const res = await uploadApi.uploadImage(file);
    return res.data.url;
  },
};
