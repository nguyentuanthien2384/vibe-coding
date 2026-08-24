import { NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../lib/server-api';

/**
 * GET /api/points/summary
 * Proxy lấy thông tin tổng quan điểm tích lũy của user
 */
export async function GET() {
  try {
    const data = await serverApiFetch<{
      statusCode: number;
      message: string;
      data: any;
    }>('/api/v1/points/summary', {
      method: 'GET',
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        statusCode: error.status || 400,
        message: error.message || 'Không thể tải thông tin điểm tích lũy',
      },
      { status: error.status || 400 },
    );
  }
}
