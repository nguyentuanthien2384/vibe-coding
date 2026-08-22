import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../../lib/server-api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  try {
    const { orderCode } = await params;
    const sessionId = request.headers.get('x-session-id');
    const headers: Record<string, string> = {};
    if (sessionId) headers['x-session-id'] = sessionId;

    const data = await serverApiFetch(
      `/api/v1/orders/${encodeURIComponent(orderCode)}/demo-confirm-payment`,
      { method: 'POST', headers },
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Không thể xác nhận thanh toán';
    return NextResponse.json({ message }, { status: 400 });
  }
}
