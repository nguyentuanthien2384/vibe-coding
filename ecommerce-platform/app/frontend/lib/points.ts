import { clientApiFetch } from './client-api';
import {
  LoyaltyPointsSummary,
  PointsConfig,
  PointsHistoryResponse,
  PointsTransactionType,
} from '../types/points.types';

export interface CheckoutPointsCalculationResult {
  userAvailablePoints: number;
  maxPointsCanUse: number;
  conversionRate: number;
  pointsToUse: number;
  discountAmount: number;
  remainingPayableAmount: number;
  isFullyCovered: boolean;
  estimatedPointsEarn: number;
}

/**
 * 1. Lấy thông tin tổng quan điểm tích lũy của user
 */
export async function getPointsSummaryApi(): Promise<LoyaltyPointsSummary> {
  const res = await clientApiFetch<{
    statusCode: number;
    message: string;
    data: LoyaltyPointsSummary;
  }>('/api/points/summary');
  return res.data;
}

/**
 * 2. Lấy lịch sử biến động điểm phân trang
 */
export async function getPointsHistoryApi(params?: {
  page?: number;
  limit?: number;
  type?: PointsTransactionType | 'ALL';
}): Promise<PointsHistoryResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.type && params.type !== 'ALL') query.set('type', params.type);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const res = await clientApiFetch<{
    statusCode: number;
    message: string;
    data: PointsHistoryResponse;
  }>(`/api/points/history${qs}`);
  return res.data;
}

/**
 * 3. Lấy cấu hình hệ thống điểm (Public)
 */
export async function getPointsConfigApi(): Promise<PointsConfig> {
  const res = await clientApiFetch<{
    statusCode: number;
    message: string;
    data: PointsConfig;
  }>('/api/points/config');
  return res.data;
}

/**
 * 4. Tính toán xem trước khấu trừ điểm tại Checkout
 */
export async function previewPointsCheckoutApi(payload: {
  pointsToUse: number;
  voucherCode?: string;
}): Promise<CheckoutPointsCalculationResult> {
  const res = await clientApiFetch<{
    statusCode: number;
    message: string;
    data: CheckoutPointsCalculationResult;
  }>('/api/points/preview-checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}
