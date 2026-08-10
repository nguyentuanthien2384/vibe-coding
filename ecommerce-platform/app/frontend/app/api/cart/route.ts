import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../lib/server-api';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get('x-session-id') || '';
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }

    const data = await serverApiFetch('/api/v1/cart', { headers });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Lỗi hệ thống khi lấy giỏ hàng' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.headers.get('x-session-id') || '';
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }

    const data = await serverApiFetch('/api/v1/cart', {
      method: 'DELETE',
      headers,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Lỗi dọn dẹp giỏ hàng' },
      { status: 500 },
    );
  }
}
