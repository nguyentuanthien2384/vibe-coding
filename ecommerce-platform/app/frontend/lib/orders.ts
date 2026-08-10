import { clientApiFetch } from "./client-api";
import { MyOrdersResponse, OrderDetailData } from "../types/auth.types";

export async function getMyOrdersApi(
  page = 1,
  limit = 10,
  status?: string,
  search?: string
): Promise<MyOrdersResponse> {
  const queryParts = [`page=${page}`, `limit=${limit}`];
  if (status && status !== "ALL") {
    queryParts.push(`status=${encodeURIComponent(status)}`);
  }
  if (search && search.trim() !== "") {
    queryParts.push(`search=${encodeURIComponent(search.trim())}`);
  }

  const response = await clientApiFetch<MyOrdersResponse>(
    `/api/orders/my-orders?${queryParts.join("&")}`,
    { method: "GET" }
  );
  return response;
}

export async function getOrderDetailApi(
  orderCode: string
): Promise<OrderDetailData> {
  const response = await clientApiFetch<OrderDetailData>(
    `/api/orders/${orderCode}`,
    { method: "GET" }
  );
  return response;
}
