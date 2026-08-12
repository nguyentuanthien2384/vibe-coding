import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/server-api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  const queryParts = [`page=${page}`, `limit=${limit}`];
  if (status) queryParts.push(`status=${encodeURIComponent(status)}`);
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  const queryString = queryParts.join("&");

  try {
    const data = await serverApiFetch<{
      statusCode: number;
      message: string;
      data: {
        items: any[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
        statusCounts?: Record<string, number>;
      };
    }>(`/api/v1/orders/my-orders?${queryString}`, {
      method: "GET",
    });

    return NextResponse.json(data.data, { status: 200 });
  } catch (error: any) {
    const statusCode = error.status || 500;
    const message = error.message || "Không thể lấy danh sách đơn hàng";
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
