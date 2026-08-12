/**
 * Helper ghép URL ảnh từ backend.
 * Nếu đường dẫn dạng tương đối (ví dụ: '/uploads/images/icon.png' hoặc 'uploads/images/icon.png'),
 * tự động nối với origin backend định nghĩa trong biến môi trường NEXT_PUBLIC_API_URL.
 */
export function getImageUrl(path: string | null | undefined, fallback: string = ''): string {
  if (!path || !path.trim()) return fallback;

  const trimmed = path.trim();

  // Nếu là URL tuyệt đối từ bên ngoài (http/https) hoặc data URI, giữ nguyên
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Nếu là đường dẫn tương đối từ backend (/uploads/... hoặc uploads/...)
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('uploads/') ||
    /\.(png|jpg|jpeg|webp|svg)($|\?)/i.test(trimmed)
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${cleanBase}${cleanPath}`;
  }

  // Ngược lại nếu là emoji hoặc chuỗi text ngẫu nhiên, giữ nguyên
  return trimmed;
}
