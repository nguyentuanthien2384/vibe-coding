import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../lib/server-api';

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.headers.get('x-session-id') || '';
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }

    const data = await serverApiFetch('/api/v1/cart/sync-guest', {
      method: 'POST',
      headers,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 400, message: error.message || 'Lỗi đồng bộ giỏ hàng vãng lai' },
      { status: 400 },
    );
  }
}
