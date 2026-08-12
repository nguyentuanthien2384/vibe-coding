import { adminFetch } from './admin-api';

export interface UploadImageResponse {
  statusCode: number;
  message: string;
  data: {
    url: string;
    filename: string;
  };
}

export const uploadApi = {
  /**
   * Upload file ảnh (JPEG, PNG, WebP, SVG) lên server backend
   */
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return adminFetch<UploadImageResponse>('/admin/upload/image', {
      method: 'POST',
      body: formData,
    });
  },
};
