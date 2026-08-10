import { LoginDto, RegisterDto } from "../types/auth.types";

export interface AuthApiResponse {
  statusCode: number;
  message: string;
}

/**
 * Gọi API Đăng ký tài khoản tới Next.js Route Handler (/api/auth/register).
 * Next.js Route Handler sẽ tự động thiết lập HttpOnly Cookie cho accessToken & refreshToken.
 * Không lưu bất kỳ thông tin user nào xuống Client.
 */
export async function registerApi(dto: RegisterDto): Promise<AuthApiResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: dto.email,
      password: dto.password,
      confirmPassword: dto.confirmPassword,
      fullName: dto.fullName,
      phone: dto.phone ? dto.phone.trim() : undefined,
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Đăng ký tài khoản không thành công.');
  }

  return json as AuthApiResponse;
}

/**
 * Gọi API Đăng nhập tới Next.js Route Handler (/api/auth/login).
 * Next.js Route Handler sẽ tự động thiết lập HttpOnly Cookie cho accessToken & refreshToken.
 */
export async function loginApi(dto: LoginDto): Promise<AuthApiResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Đăng nhập không thành công.');
  }

  return json as AuthApiResponse;
}

import { syncGuestCartApi } from "./cart";

/**
 * Gọi API Đăng xuất tới Next.js Route Handler (/api/auth/logout).
 * Tự động đồng bộ giỏ hàng từ User sang Guest Session & Xóa toàn bộ HttpOnly Cookies.
 */
export async function logoutApi(): Promise<void> {
  try {
    // 1. Đồng bộ giỏ hàng từ User sang Guest Session trên DB trước khi xóa token
    await syncGuestCartApi();
  } catch {
    // Bỏ qua lỗi nếu việc đồng bộ không thành công
  }

  // 2. Xóa HttpOnly Cookies
  await fetch('/api/auth/logout', {
    method: 'POST',
  });
}


/**
 * Gọi API Refresh Token tới Next.js Route Handler (/api/auth/refresh).
 * Cấp lại accessToken & refreshToken HttpOnly Cookies.
 */
export async function refreshTokenApi(): Promise<AuthApiResponse & { data?: { accessToken: string } }> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Làm mới phiên đăng nhập không thành công.');
  }

  return json;
}

import { UserProfile, UpdateProfileDto, ChangePasswordDto } from "../types/auth.types";

/**
 * Gọi API lấy thông tin tài khoản hiện tại từ Next.js Route Handler (/api/auth/me).
 * Tự động kích hoạt refresh token nếu accessToken bị sai/hết hạn.
 */
export async function getMeApi(): Promise<UserProfile> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Chưa đăng nhập hoặc phiên làm việc hết hạn.');
  }

  return json.data as UserProfile;
}

/**
 * Gọi API cập nhật thông tin cá nhân tới Next.js Route Handler (/api/auth/profile).
 */
export async function updateProfileApi(dto: UpdateProfileDto): Promise<UserProfile> {
  const response = await fetch('/api/auth/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Cập nhật thông tin cá nhân thất bại.');
  }

  return json.data as UserProfile;
}

/**
 * Gọi API đổi mật khẩu tới Next.js Route Handler (/api/auth/change-password).
 */
export async function changePasswordApi(dto: ChangePasswordDto): Promise<AuthApiResponse> {
  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
  }

  return json as AuthApiResponse;
}


