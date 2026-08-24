export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'UNPAID'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'COD'
  | 'VIETQR'
  | 'QR_CODE'
  | 'BANK_TRANSFER';

export interface OrderItem {
  id: string | number;
  productId: number;
  productName: string;
  productImage?: string;
  productImageUrl?: string;
  quantity: number;
  price: number;
  originalPrice?: number | null;
  subtotal?: number;
  itemTotal?: number;
}

export interface CustomerInfo {
  id?: string | number | null;
  name: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  detailAddress: string;
  note?: string | null;
}

export interface OrderSummary {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  pointsUsed?: number;
  pointsDiscount?: number;
  pointsEarned?: number;
  couponCode?: string | null;
  voucherCode?: string | null;
  totalAmount: number;
}

export interface OrderListItem {
  id: string | number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  itemCount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderNote?: string | null;
  createdAt: string;
}

export interface OrderDetail extends OrderListItem {
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  summary: OrderSummary;
  paidAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  updatedAt?: string;
}

export interface OrderFilterParams {
  search?: string;
  orderStatus?: OrderStatus | 'ALL';
  paymentStatus?: PaymentStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}
