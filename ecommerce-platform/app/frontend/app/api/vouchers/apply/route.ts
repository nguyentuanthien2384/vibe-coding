import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../lib/server-api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = req.headers.get('x-session-id') || '';
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }

    const data = await serverApiFetch('/api/v1/vouchers/apply', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        statusCode: 400,
        message: error.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn',
      },
      { status: 400 },
    );
  }
}
