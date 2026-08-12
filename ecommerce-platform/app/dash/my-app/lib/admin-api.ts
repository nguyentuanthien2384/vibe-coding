/**
 * Client-side Fetch Interceptor cho Admin Dashboard (Client Components)
 * Tự động bắt HTTP status 401 Unauthorized, gọi refresh token và retry request gốc.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (tokenUpdated: boolean) => void;
  reject: (reason: Error) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(true);
    }
  });
  failedQueue = [];
};

/**
 * Lấy Access Token từ localStorage hoặc cookies
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('admin_access_token');
  if (token) return token;

  const match = document.cookie.match(/(?:^|;\s*)(?:admin_access_token|accessToken)=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Cập nhật hoặc xóa Access Token trong localStorage & cookies
 */
export function setAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('admin_access_token', token);
    document.cookie = `admin_access_token=${token}; path=/; max-age=900; SameSite=Lax`;
    document.cookie = `accessToken=${token}; path=/; max-age=900; SameSite=Lax`;
  } else {
    localStorage.removeItem('admin_access_token');
    document.cookie = 'admin_access_token=; path=/; max-age=0; path=/';
    document.cookie = 'accessToken=; path=/; max-age=0; path=/';
  }
}

/**
 * Custom fetch wrapper cho Admin Dashboard hỗ trợ Refresh Token tự động
 */
export async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isCustomUrl = path.startsWith('http://') || path.startsWith('https://');
  const url = isCustomUrl
    ? path
    : path.startsWith('/api/')
    ? path
    : `${BASE_URL}/api/v1${path}`;

  const token = getAccessToken();
  const isFormData = options.body instanceof FormData;

  const rawHeaders = { ...(options.headers as Record<string, string>) };
  delete rawHeaders['Authorization'];
  delete rawHeaders['authorization'];

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...rawHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Bắt lỗi 401 Unauthorized (loại trừ các request auth login/refresh)
  if (res.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
    if (isRefreshing) {
      return new Promise<boolean>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => adminFetch<T>(path, options));
    }

    isRefreshing = true;

    try {
      let newToken: string | null = null;

      // 1. Thử gọi Next.js Route Handler /api/auth/refresh trước
      try {
        const bffRes = await fetch('/api/auth/refresh', { method: 'POST' });
        if (bffRes.ok) {
          const bffData = await bffRes.json();
          newToken = bffData?.data?.accessToken || null;
        }
      } catch {
        // Tiếp tục thử gọi trực tiếp NestJS backend
      }

      // 2. Fallback: Gọi trực tiếp NestJS Backend /api/v1/auth/refresh-token nếu BFF không có sẵn
      if (!newToken) {
        const directRes = await fetch(`${BASE_URL}/api/v1/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          newToken = directData?.data?.accessToken || null;
        }
      }

      if (!newToken) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }

      // Cập nhật token mới vào storage & cookies
      setAccessToken(newToken);

      // Giải phóng tất cả request đang chờ trong queue
      processQueue(null);

      // Retry lại request gốc với token mới
      const newHeaders: Record<string, string> = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...rawHeaders,
        Authorization: `Bearer ${newToken}`,
      };

      return await adminFetch<T>(path, {
        ...options,
        headers: newHeaders,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Lỗi làm mới token');
      processQueue(error);
      setAccessToken(null);

      if (typeof window !== 'undefined') {
        window.location.assign('/login?expired=1');
      }

      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Lỗi không xác định' }));
    const message = (errorBody as { message?: string | string[] }).message;
    const formattedMessage = Array.isArray(message) ? message.join(', ') : message || `HTTP ${res.status}`;
    throw new Error(formattedMessage);
  }

  return res.json() as Promise<T>;
}
