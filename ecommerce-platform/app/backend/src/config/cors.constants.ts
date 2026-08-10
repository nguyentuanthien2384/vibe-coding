const isDev = process.env.NODE_ENV !== 'production';

/**
 * Whitelist các origin được phép gọi API.
 * - Development: thêm localhost với các port phổ biến.
 * - Production: chỉ giữ domain chính thức.
 */
export const CORS_WHITELIST: string[] = isDev
  ? [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ]
  : [
      // TODO: Thay bằng domain production thực tế
      'https://yourdomain.com',
      'https://www.yourdomain.com',
    ];
