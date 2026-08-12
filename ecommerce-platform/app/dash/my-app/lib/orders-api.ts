/**
 * API Client cho Admin Order Management Module (Client & Server context)
 * Base URL đọc từ env NEXT_PUBLIC_API_URL (default: http://localhost:3001).
 * Đính kèm JWT Access Token tự động qua adminFetch.
 */

import { adminFetch } from './admin-api';
import {
  OrderListItem,
  OrderDetail,
  OrderStatus,
  PaymentStatus,
} from '../features/orders/types/order.types';

export interface GetAdminOrdersParams {
  search?: string;
  orderStatus?: OrderStatus | 'ALL';
  paymentStatus?: PaymentStatus | 'ALL';
  paymentMethod?: string | 'ALL';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

export interface AdminOrdersListApiResponse {
  statusCode: number;
  message: string;
  data: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summaryStats: AdminOrderSummaryStats;
}

export interface AdminOrderDetailApiResponse {
  statusCode: number;
  message: string;
  data: OrderDetail;
}

export interface UpdateOrderStatusPayload {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  cancelReason?: string;
  adminNote?: string;
}

export interface AdminOrderMutateApiResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    orderCode: string;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    paidAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
    updatedAt: string;
  };
}

export const ordersApi = {
  /**
   * GET /api/v1/admin/orders
   * Lấy danh sách đơn hàng có phân trang, bộ lọc và thống kê tổng quan
   */
  getList: (params: GetAdminOrdersParams = {}): Promise<AdminOrdersListApiResponse> => {
    const query = new URLSearchParams();
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.orderStatus && params.orderStatus !== 'ALL') query.set('orderStatus', params.orderStatus);
    if (params.paymentStatus && params.paymentStatus !== 'ALL') query.set('paymentStatus', params.paymentStatus);
    if (params.paymentMethod && params.paymentMethod !== 'ALL') query.set('paymentMethod', params.paymentMethod);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const qs = query.toString();
    return adminFetch<AdminOrdersListApiResponse>(`/admin/orders${qs ? `?${qs}` : ''}`);
  },

  /**
   * GET /api/v1/admin/orders/:id
   * Lấy chi tiết đơn hàng theo ID hoặc OrderCode
   */
  getOne: (id: string | number): Promise<AdminOrderDetailApiResponse> => {
    return adminFetch<AdminOrderDetailApiResponse>(`/admin/orders/${id}`);
  },

  /**
   * PATCH /api/v1/admin/orders/:id/status
   * Cập nhật trạng thái đơn hàng và/hoặc trạng thái thanh toán
   */
  updateStatus: (
    id: string | number,
    payload: UpdateOrderStatusPayload
  ): Promise<AdminOrderMutateApiResponse> => {
    return adminFetch<AdminOrderMutateApiResponse>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
