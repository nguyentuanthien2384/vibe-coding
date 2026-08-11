import { NextResponse } from 'next/server';
import { serverApiFetch } from '@/lib/server-api';
import { EmailLogsResponse } from '@/types/email-log.types';

/**
 * GET /api/notifications/my-notifications
 * Next.js BFF Route Handler lấy danh sách email thông báo cá nhân của User đang đăng nhập (/api/v1/mail/my-notifications).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const targetPath = `/api/v1/mail/my-notifications${queryString ? `?${queryString}` : ''}`;

    const data = await serverApiFetch<EmailLogsResponse>(targetPath);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Không thể lấy thông báo của bạn';
    return NextResponse.json({ message }, { status: 400 });
  }
}
