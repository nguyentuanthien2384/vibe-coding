import { NextResponse } from 'next/server';
import { serverApiFetch } from '@/lib/server-api';
import { ResendEmailResponse } from '@/types/email-log.types';

/**
 * POST /api/admin/email-logs/:id/resend
 * Next.js BFF Route Handler ủy quyền gọi sang NestJS Backend (/api/v1/admin/email-logs/:id/resend).
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const targetPath = `/api/v1/admin/email-logs/${id}/resend`;

    const data = await serverApiFetch<ResendEmailResponse>(targetPath, {
      method: 'POST',
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gửi lại email thất bại';
    return NextResponse.json({ message }, { status: 400 });
  }
}
