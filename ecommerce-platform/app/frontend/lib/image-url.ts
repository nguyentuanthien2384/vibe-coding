/**
 * Helper ghép URL ảnh từ backend.
 * Nếu đường dẫn dạng tương đối (ví dụ: '/uploads/images/icon.png'),
 * tự động nối với origin backend định nghĩa trong biến môi trường NEXT_PUBLIC_API_URL.
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path || !path.trim()) return null;

  // Nếu là URL tuyệt đối từ bên ngoài (Unsplash, VietQR...) hoặc emoji, giữ nguyên
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}
