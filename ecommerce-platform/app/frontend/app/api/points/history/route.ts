import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../lib/server-api';

/**
 * GET /api/points/history
 * Proxy lấy danh sách lịch sử biến động điểm phân trang
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const type = searchParams.get('type') || 'ALL';

    const queryString = new URLSearchParams({
      page,
      limit,
      type,
    }).toString();

    const data = await serverApiFetch<{
      statusCode: number;
      message: string;
      data: any;
    }>(`/api/v1/points/history?${queryString}`, {
      method: 'GET',
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        statusCode: error.status || 400,
        message: error.message || 'Không thể tải lịch sử điểm',
      },
      { status: error.status || 400 },
    );
  }
}
