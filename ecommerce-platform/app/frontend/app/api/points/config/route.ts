import { NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../lib/server-api';

/**
 * GET /api/points/config
 * Proxy lấy cấu hình hệ thống điểm (Public)
 */
export async function GET() {
  try {
    const data = await serverApiFetch<{
      statusCode: number;
      message: string;
      data: any;
    }>('/api/v1/points/config', {
      method: 'GET',
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        statusCode: error.status || 400,
        message: error.message || 'Không thể tải cấu hình điểm',
      },
      { status: error.status || 400 },
    );
  }
}
