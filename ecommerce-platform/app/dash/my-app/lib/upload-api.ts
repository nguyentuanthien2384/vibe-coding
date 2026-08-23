import { adminFetch } from './admin-api';

export interface UploadImageResponse {
  statusCode: number;
  message: string;
  data: {
    url: string;
    filename: string;
  };
}

export interface MediaItem {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  mimeType: string;
  isReferenced: boolean;
}

export interface MediaListResponse {
  statusCode: number;
  message: string;
  data: MediaItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeleteMediaResponse {
  statusCode: number;
  message: string;
  data: {
    filename: string;
  };
}

export const uploadApi = {
  /**
   * Upload file ảnh (JPEG, PNG, WebP, SVG, GIF) lên server backend
   */
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return adminFetch<UploadImageResponse>('/admin/upload/image', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Lấy danh sách media từ server backend kèm tìm kiếm và phân trang
   */
  getMediaList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<MediaListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    const qs = query.toString();
    const endpoint = `/admin/upload/media${qs ? `?${qs}` : ''}`;

    return adminFetch<MediaListResponse>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Xóa một file media theo tên file
   */
  deleteMedia: async (filename: string, force = false): Promise<DeleteMediaResponse> => {
    return adminFetch<DeleteMediaResponse>(
      `/admin/upload/media/${encodeURIComponent(filename)}${force ? '?force=true' : ''}`,
      {
        method: 'DELETE',
      },
    );
  },

  /**
   * Đổi tên một file media
   */
  renameMedia: async (
    filename: string,
    newFilename: string,
  ): Promise<{ statusCode: number; message: string; data: { filename: string; url: string } }> => {
    return adminFetch<{ statusCode: number; message: string; data: { filename: string; url: string } }>(
      `/admin/upload/media/${encodeURIComponent(filename)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newFilename }),
      },
    );
  },
};
