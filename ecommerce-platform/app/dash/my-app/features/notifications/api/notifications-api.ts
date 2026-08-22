import { adminFetch } from '../../../lib/admin-api';
import {
  AdminNotification,
  AdminNotificationsApiResponse,
} from '../../../types/notification.types';

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export async function getAdminNotificationsApi(
  params: GetNotificationsParams = {},
): Promise<{
  items: AdminNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.isRead !== undefined) query.append('isRead', params.isRead.toString());

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const response = await adminFetch<AdminNotificationsApiResponse>(
    `/notifications${queryString}`,
  );
  return response.data;
}

export async function markNotificationAsReadApi(
  id: number | string,
): Promise<AdminNotification> {
  const response = await adminFetch<{
    statusCode: number;
    message: string;
    data: AdminNotification;
  }>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
  return response.data;
}

export async function markAllNotificationsAsReadApi(): Promise<void> {
  await adminFetch<{ statusCode: number; message: string }>(
    '/notifications/read-all',
    {
      method: 'PATCH',
    },
  );
}
