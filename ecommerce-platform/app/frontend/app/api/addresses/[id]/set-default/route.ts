import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../../lib/server-api';

/**
 * PATCH /api/addresses/[id]/set-default
 * Đặt địa chỉ làm mặc định
 */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await serverApiFetch<any>(`/api/v1/addresses/${id}/set-default`, {
      method: 'PATCH',
    });
    const address = res?.data || res;
    return NextResponse.json(address);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Đặt địa chỉ mặc định thất bại';
    return NextResponse.json({ message }, { status: 400 });
  }
}
