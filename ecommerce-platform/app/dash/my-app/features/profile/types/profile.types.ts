export type ProfileTabType = 'info' | 'security';

export interface UpdateProfileInput {
  fullName: string;
  phone?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
