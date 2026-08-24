import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../lib/server-api';

/**
 * POST /api/points/preview-checkout
 * Proxy tính toán xem trước điểm dùng và giảm giá tại Checkout
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await serverApiFetch<{
      statusCode: number;
      message: string;
      data: any;
    }>('/api/v1/points/preview-checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        statusCode: error.status || 400,
        message: error.message || 'Tính toán điểm checkout thất bại',
      },
      { status: error.status || 400 },
    );
  }
}
