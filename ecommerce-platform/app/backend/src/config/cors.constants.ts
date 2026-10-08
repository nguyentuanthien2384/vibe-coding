const isDev = process.env.NODE_ENV !== 'production';

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
];

/**
 * Kiểm tra xem Origin có hợp lệ hay không.
 * Hỗ trợ các biến môi trường:
 * - FRONTEND_URL
 * - ADMIN_URL
 * - CORS_ORIGINS (danh sách phân cách bằng dấu phẩy)
 * - Tự động hỗ trợ các subdomain *.onrender.com và *.vercel.app khi deploy demo
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // Cho phép requests nội bộ, curl, mobile, server-to-server

  // Lấy các origin từ env
  const envOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()) : []),
  ].filter(Boolean) as string[];

  const allowedList = new Set<string>([
    ...(isDev ? DEFAULT_DEV_ORIGINS : []),
    ...envOrigins,
  ]);

  if (allowedList.has(origin)) {
    return true;
  }

  // Cho phép preview/demo URLs trên Vercel và Render
  try {
    const url = new URL(origin);
    if (
      url.hostname.endsWith('.onrender.com') ||
      url.hostname.endsWith('.vercel.app') ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1'
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export const CORS_WHITELIST: string[] = DEFAULT_DEV_ORIGINS;

