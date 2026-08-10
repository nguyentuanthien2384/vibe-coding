import { getOrCreateGuestSessionId } from './cart-session';

export interface ApiCartItem {
  id: number;
  productId: number;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  stock: number;
  isAvailable: boolean;
  itemTotal: number;
}

export interface ApiCartResponse {
  cartId: number;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  items: ApiCartItem[];
}

/**
 * Lấy danh sách headers mặc định gửi kèm Session ID cho Guest Cart
 */
function getHeaders(): Record<string, string> {
  const sessionId = getOrCreateGuestSessionId();
  return {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  };
}

/**
 * API Lấy chi tiết giỏ hàng hiện tại
 */
export async function getCartApi(): Promise<ApiCartResponse> {
  const res = await fetch('/api/cart', {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || 'Không thể lấy dữ liệu giỏ hàng');
  }

  const json = await res.json();
  return json.data;
}

/**
 * API Thêm sản phẩm vào giỏ hàng
 */
export async function addToCartApi(
  productId: number,
  quantity: number = 1,
): Promise<ApiCartResponse> {
  const res = await fetch('/api/cart/items', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
  }

  const json = await res.json();
  return json.data;
}

/**
 * API Cập nhật số lượng sản phẩm trong giỏ
 */
export async function updateCartItemApi(
  cartItemId: number,
  quantity: number,
): Promise<ApiCartResponse> {
  const res = await fetch(`/api/cart/items/${cartItemId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ quantity }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || 'Không thể cập nhật số lượng sản phẩm');
  }

  const json = await res.json();
  return json.data;
}

/**
 * API Xóa 1 sản phẩm khỏi giỏ hàng
 */
export async function removeCartItemApi(
  cartItemId: number,
): Promise<ApiCartResponse> {
  const res = await fetch(`/api/cart/items/${cartItemId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng');
  }

  const json = await res.json();
  return json.data;
}

/**
 * API Dọn dẹp toàn bộ giỏ hàng
 */
export async function clearCartApi(): Promise<ApiCartResponse> {
  const res = await fetch('/api/cart', {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || 'Không thể dọn dẹp giỏ hàng');
  }

  const json = await res.json();
  return json.data;
}

/**
 * API Gộp giỏ hàng vãng lai sau khi người dùng Đăng Nhập thành công
 */
export async function mergeCartApi(
  items: Array<{ productId: number; quantity: number }>,
): Promise<ApiCartResponse> {
  const res = await fetch('/api/cart/merge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || 'Không thể đồng bộ giỏ hàng');
  }

  const json = await res.json();
  return json.data;
}

/**
 * API Sao chép sản phẩm từ giỏ hàng User sang Guest Session khi Đăng Xuất
 */
export async function syncGuestCartApi(): Promise<ApiCartResponse> {
  const res = await fetch('/api/cart/sync-guest', {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || 'Không thể đồng bộ giỏ hàng vãng lai');
  }

  const json = await res.json();
  return json.data;
}
