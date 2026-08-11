export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'STOCK' | 'SYSTEM';
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}
