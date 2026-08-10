// lib/client-api.ts
// Client-side Fetch Interceptor dành riêng cho React Client Components
// Tự động bắt 401 Unauthorized, gọi /api/auth/refresh để lấy token mới và retry request gốc

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
 * Custom fetch wrapper cho Client Component hỗ trợ Refresh Token tự động.
 */
export async function clientApiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const isCustomUrl = path.startsWith('http://') || path.startsWith('https://');
  const url = isCustomUrl
    ? path
    : path.startsWith('/api/')
    ? path
    : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  // Nếu gặp lỗi 401 Unauthorized và không phải đang gọi API auth
  if (res.status === 401 && !path.includes('/api/auth/')) {
    if (isRefreshing) {
      // Đang có 1 request refresh token chạy -> Xếp hàng đợi
      return new Promise<boolean>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => fetch(url, options))
        .then((retryRes) => {
          if (!retryRes.ok) {
            throw new Error(`API Error ${retryRes.status}: ${url}`);
          }
          return retryRes.json() as Promise<T>;
        });
    }

    isRefreshing = true;

    try {
      // Gọi Route Handler /api/auth/refresh của Next.js
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
      });

      if (!refreshRes.ok) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }

      // Xử lý tất cả các request trong hàng đợi
      processQueue(null);

      // Retry lại request ban đầu
      const retryRes = await fetch(url, options);
      if (!retryRes.ok) {
        throw new Error(`API Error ${retryRes.status}: ${url}`);
      }

      return (await retryRes.json()) as T;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Lỗi làm mới token');
      processQueue(error);

      // Chuyển hướng về trang login nếu chạy ở trình duyệt
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }

      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMsg = errorData?.message || `API error ${res.status}: ${url}`;
    throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
  }

  return res.json() as Promise<T>;
}
