import { clientApiFetch } from './client-api';
import {
  EmailLogQueryDto,
  EmailLogsResponse,
  ResendEmailResponse,
} from '../types/email-log.types';

/**
 * Lấy danh sách nhật ký email kèm bộ lọc & phân trang cho Admin.
 */
export async function getEmailLogsApi(
  params?: EmailLogQueryDto
): Promise<EmailLogsResponse['data']> {
  const query = new URLSearchParams();

  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.type) query.append('type', params.type);
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search.trim());

  const queryString = query.toString();
  const path = `/api/admin/email-logs${queryString ? `?${queryString}` : ''}`;

  const res = await clientApiFetch<EmailLogsResponse>(path, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  return res.data;
}

/**
 * Thực thi gửi lại (resend) email theo log ID cho Admin.
 */
export async function resendEmailApi(id: number): Promise<ResendEmailResponse> {
  return clientApiFetch<ResendEmailResponse>(`/api/admin/email-logs/${id}/resend`, {
    method: 'POST',
  });
}

/**
 * Lấy danh sách thông báo email của riêng User đang đăng nhập.
 */
export async function getMyNotificationsApi(
  params?: EmailLogQueryDto
): Promise<EmailLogsResponse['data']> {
  const query = new URLSearchParams();

  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.type) query.append('type', params.type);
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search.trim());

  const queryString = query.toString();
  const path = `/api/notifications/my-notifications${queryString ? `?${queryString}` : ''}`;

  const res = await clientApiFetch<EmailLogsResponse>(path, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  return res.data;
}
