import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../../lib/server-api';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  try {
    const { orderCode } = await params;
    const data = await serverApiFetch(`/api/v1/orders/${orderCode}/status`, {
      cache: 'no-store',
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        statusCode: 404,
        message: error.message || 'Không tìm thấy thông tin đơn hàng',
      },
      { status: 404 },
    );
  }
}
