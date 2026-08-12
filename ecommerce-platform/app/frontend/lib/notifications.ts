import { clientApiFetch } from './client-api';

export interface InAppNotification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: 'ORDER_STATUS_CHANGED' | 'PAYMENT_CONFIRMED' | 'SYSTEM_ALERT';
  orderCode: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface GetNotificationsApiResponse {
  statusCode: number;
  message: string;
  data: {
    items: InAppNotification[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const notificationsApi = {
  /**
   * GET /api/v1/notifications
   * Lấy danh sách thông báo đẩy In-App cá nhân có phân trang và số dư chưa đọc
   */
  getList: (page = 1, limit = 10): Promise<GetNotificationsApiResponse> => {
    return clientApiFetch<GetNotificationsApiResponse>(
      `/api/v1/notifications?page=${page}&limit=${limit}`,
      { cache: 'no-store' }
    );
  },

  /**
   * PATCH /api/v1/notifications/:id/read
   * Đánh dấu 1 thông báo là đã đọc
   */
  markAsRead: (id: number): Promise<{ statusCode: number; message: string }> => {
    return clientApiFetch<{ statusCode: number; message: string }>(
      `/api/v1/notifications/${id}/read`,
      { method: 'PATCH' }
    );
  },

  /**
   * PATCH /api/v1/notifications/read-all
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: (): Promise<{ statusCode: number; message: string }> => {
    return clientApiFetch<{ statusCode: number; message: string }>(
      `/api/v1/notifications/read-all`,
      { method: 'PATCH' }
    );
  },
};
