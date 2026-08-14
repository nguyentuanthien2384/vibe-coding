import { adminFetchResponse } from '@/lib/admin-api';

export interface ExportReportParams {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Tải báo cáo đơn hàng dạng file Excel (.xlsx) từ backend
 */
export async function downloadOrdersReportExcel(params: ExportReportParams = {}): Promise<void> {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.set('search', params.search);
  if (params.orderStatus && params.orderStatus !== 'ALL') queryParams.set('orderStatus', params.orderStatus);
  if (params.paymentStatus && params.paymentStatus !== 'ALL') queryParams.set('paymentStatus', params.paymentStatus);
  if (params.paymentMethod && params.paymentMethod !== 'ALL') queryParams.set('paymentMethod', params.paymentMethod);
  if (params.startDate) queryParams.set('startDate', params.startDate);
  if (params.endDate) queryParams.set('endDate', params.endDate);

  const response = await adminFetchResponse(`/admin/orders/export?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('Không thể tải xuống báo cáo đơn hàng dạng Excel. Vui lòng thử lại sau.');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  
  const timestamp = new Date().toISOString().slice(0, 10);
  a.download = `bao-cao-don-hang-${timestamp}.xlsx`;
  
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}
