import { getOrCreateGuestSessionId } from './cart-session';
import {
  AppliedVoucherData,
  CreateOrderResponse,
  PaymentMethodType,
  ShippingMethodType,
} from '../types/checkout';

export interface CreateOrderApiPayload {
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    provinceName: string;
    districtName: string;
    wardName: string;
    detailAddress: string;
  };
  shippingMethod: ShippingMethodType;
  paymentMethod: PaymentMethodType;
  voucherCode?: string;
  orderNote?: string;
}

function getHeaders(): Record<string, string> {
  const sessionId = getOrCreateGuestSessionId();
  return {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  };
}

/**
 * API Áp dụng Mã giảm giá
 */
export async function applyVoucherApi(
  code: string,
  subtotal: number,
): Promise<AppliedVoucherData> {
  const res = await fetch('/api/vouchers/apply', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code, subtotal }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || 'Mã giảm giá không hợp lệ hoặc không áp dụng được',
    );
  }

  const json = await res.json();
  return json.data;
}

/**
 * API Khởi tạo Đơn hàng (POST /api/orders)
 */
export async function createOrderApi(
  payload: CreateOrderApiPayload,
): Promise<CreateOrderResponse> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const msg = errorData?.message || 'Khởi tạo đơn hàng thất bại';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }

  const json = await res.json();
  return json.data;
}

/**
 * API Polling Trạng thái Thanh toán Đơn hàng (GET /api/orders/:orderCode/status)
 */
export async function getOrderStatusApi(orderCode: string): Promise<{
  orderCode: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  paidAt?: string;
  totalAmount: number;
}> {
  const res = await fetch(`/api/orders/${orderCode}/status`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Không thể tra cứu đơn hàng');
  }

  const json = await res.json();
  return json.data;
}
