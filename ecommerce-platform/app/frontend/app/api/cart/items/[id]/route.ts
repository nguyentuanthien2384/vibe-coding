import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../../lib/server-api';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const sessionId = req.headers.get('x-session-id') || '';
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }

    const data = await serverApiFetch(`/api/v1/cart/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 400, message: error.message || 'Lỗi cập nhật số lượng sản phẩm' },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const sessionId = req.headers.get('x-session-id') || '';
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }

    const data = await serverApiFetch(`/api/v1/cart/items/${id}`, {
      method: 'DELETE',
      headers,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 400, message: error.message || 'Lỗi xóa sản phẩm khỏi giỏ hàng' },
      { status: 400 },
    );
  }
}
