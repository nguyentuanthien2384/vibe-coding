/**
 * Helper chuẩn hóa URL của Backend API.
 * Xử lý mọi trường hợp:
 * - Khi Render Blueprint trả về internal service name (ví dụ: 'techbite-backend') -> tự động thành 'https://techbite-backend.onrender.com'
 * - Khi Render trả về hostname thiếu protocol (ví dụ: 'techbite-backend.onrender.com') -> tự động thành 'https://techbite-backend.onrender.com'
 * - Khi ở localhost -> giữ nguyên 'http://localhost:3001'
 */
export function getApiBaseUrl(raw?: string): string {
  let url = (raw || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (!url.includes('.') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
      url = `${url}.onrender.com`;
    }
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, '');
}

export const API_BASE = getApiBaseUrl();
