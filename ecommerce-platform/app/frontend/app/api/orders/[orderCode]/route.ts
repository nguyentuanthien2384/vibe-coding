import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/server-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderCode: string }> }
) {
  const { orderCode } = await params;

  if (!orderCode) {
    return NextResponse.json(
      { error: "Thiếu mã đơn hàng" },
      { status: 400 }
    );
  }

  try {
    const data = await serverApiFetch<{
      statusCode: number;
      message: string;
      data: any;
    }>(`/api/v1/orders/${orderCode}`, {
      method: "GET",
    });

    return NextResponse.json(data.data, { status: 200 });
  } catch (error: any) {
    const statusCode = error.status || 500;
    const message = error.message || "Không thể lấy chi tiết đơn hàng";
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
