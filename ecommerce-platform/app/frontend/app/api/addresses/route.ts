import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../lib/server-api';

/**
 * GET /api/addresses
 * Lấy danh sách địa chỉ giao hàng của user
 */
export async function GET() {
  try {
    const res = await serverApiFetch<any>('/api/v1/addresses', {
      method: 'GET',
    });
    const addresses = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    return NextResponse.json(addresses);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Không thể tải danh sách địa chỉ';
    return NextResponse.json({ message }, { status: 400 });
  }
}

/**
 * POST /api/addresses
 * Tạo địa chỉ giao hàng mới
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await serverApiFetch<any>('/api/v1/addresses', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const address = res?.data || res;
    return NextResponse.json(address, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Tạo địa chỉ giao hàng thất bại';
    return NextResponse.json({ message }, { status: 400 });
  }
}
