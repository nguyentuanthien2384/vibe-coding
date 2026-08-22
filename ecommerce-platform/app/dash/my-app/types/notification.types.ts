export type AdminNotificationType =
  | 'NEW_ORDER'
  | 'NEW_CUSTOMER'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_CONFIRMED'
  | 'ORDER_STATUS_CHANGED'
  | 'SYSTEM_ALERT'
  | 'ORDER'
  | 'STOCK'
  | 'SYSTEM';

export interface AdminNotification {
  id: number | string;
  title: string;
  content: string;
  message?: string;
  type: AdminNotificationType;
  orderCode?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AdminNotificationsApiResponse {
  statusCode: number;
  message: string;
  data: {
    items: AdminNotification[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
