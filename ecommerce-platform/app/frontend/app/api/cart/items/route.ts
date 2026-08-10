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

    const data = await serverApiFetch('/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 400, message: error.message || 'Lỗi thêm sản phẩm vào giỏ hàng' },
      { status: 400 },
    );
  }
}
