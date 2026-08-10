import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../lib/server-api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await serverApiFetch('/api/v1/cart/merge', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 400, message: error.message || 'Lỗi đồng bộ giỏ hàng' },
      { status: 400 },
    );
  }
}
