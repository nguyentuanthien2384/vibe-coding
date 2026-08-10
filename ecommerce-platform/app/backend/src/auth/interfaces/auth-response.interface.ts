import { Role } from '@prisma/client';

export interface AuthUserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  createdAt: Date;
  lastLoginAt?: Date | null;
}

export interface RegisterResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponse;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponse;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: number;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}
