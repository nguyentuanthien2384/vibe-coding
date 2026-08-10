import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '../../../../lib/server-api';

/**
 * PATCH /api/addresses/[id]
 * Cập nhật thông tin địa chỉ giao hàng
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const res = await serverApiFetch<any>(`/api/v1/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    const address = res?.data || res;
    return NextResponse.json(address);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cập nhật địa chỉ thất bại';
    return NextResponse.json({ message }, { status: 400 });
  }
}

/**
 * DELETE /api/addresses/[id]
 * Xóa địa chỉ giao hàng
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await serverApiFetch<any>(`/api/v1/addresses/${id}`, {
      method: 'DELETE',
    });
    const data = res?.data || res;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Xóa địa chỉ thất bại';
    return NextResponse.json({ message }, { status: 400 });
  }
}
