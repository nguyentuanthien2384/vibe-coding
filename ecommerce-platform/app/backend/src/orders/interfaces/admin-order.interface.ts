import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

export interface AdminOrderListItem {
  id: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  itemCount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
}

export interface AdminOrderSummaryStats {
  totalOrders: number;
  pendingCount: number;
  confirmedCount: number;
  processingCount: number;
  shippingCount: number;
  deliveredCount: number;
  cancelledCount: number;
  unpaidCount: number;
  paidCount: number;
}

export interface AdminOrdersListResponse {
  statusCode: number;
  message: string;
  data: AdminOrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summaryStats: AdminOrderSummaryStats;
}

export interface AdminOrderItemDetail {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  itemTotal: number;
}

export interface AdminOrderDetailData {
  id: number;
  orderCode: string;
  customer: {
    id: number | null;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    recipientName: string;
    phone: string;
    provinceName: string;
    districtName: string;
    wardName: string;
    detailAddress: string;
    note: string | null;
  };
  items: AdminOrderItemDetail[];
  summary: {
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    voucherCode: string | null;
    totalAmount: number;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paidAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminOrderDetailResponse {
  statusCode: number;
  message: string;
  data: AdminOrderDetailData;
}

export interface AdminOrderMutateResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    orderCode: string;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    paidAt: Date | null;
    completedAt: Date | null;
    cancelledAt: Date | null;
    updatedAt: Date;
  };
}
