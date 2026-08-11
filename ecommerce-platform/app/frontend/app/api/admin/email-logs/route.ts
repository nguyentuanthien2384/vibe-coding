import { NextResponse } from 'next/server';
import { serverApiFetch } from '@/lib/server-api';
import { EmailLogsResponse } from '@/types/email-log.types';

/**
 * GET /api/admin/email-logs
 * Next.js BFF Route Handler ủy quyền gọi sang NestJS Backend (/api/v1/admin/email-logs).
 * Tự động chuyển tiếp các query parameters và đính kèm JWT Token phía server.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const targetPath = `/api/v1/admin/email-logs${queryString ? `?${queryString}` : ''}`;

    const data = await serverApiFetch<EmailLogsResponse>(targetPath);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Không thể lấy danh sách email logs';
    return NextResponse.json({ message }, { status: 400 });
  }
}
