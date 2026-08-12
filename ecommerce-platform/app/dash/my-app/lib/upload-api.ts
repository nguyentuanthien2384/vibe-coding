/**
 * API client hỗ trợ upload file ảnh lên NestJS Backend.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UploadImageResponse {
  statusCode: number;
  message: string;
  data: {
    url: string;
    filename: string;
  };
}

async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

export const uploadApi = {
  /**
   * Upload file ảnh (JPEG, PNG, WebP, SVG) lên server backend
   */
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const token = await getAccessToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/api/v1/admin/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: 'Lỗi upload file' }));
      throw new Error((errorBody as { message?: string }).message || `HTTP ${res.status}`);
    }

    return res.json() as Promise<UploadImageResponse>;
  },
};
