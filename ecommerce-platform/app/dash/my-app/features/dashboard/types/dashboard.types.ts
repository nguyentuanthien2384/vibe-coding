export type DashboardOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type DashboardPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

export interface DashboardMetric {
  value: number;
  changePercent: number | null;
}

export interface DashboardRevenuePoint {
  date: string;
  label: string;
  revenue: number;
}

export interface DashboardRecentOrder {
  id: number;
  orderCode: string;
  customerName: string;
  itemCount: number;
  totalAmount: number;
  orderStatus: DashboardOrderStatus;
  paymentStatus: DashboardPaymentStatus;
  createdAt: string;
}

export interface DashboardStockAlert {
  id: number;
  name: string;
  stock: number;
  imageUrl: string;
}

export interface DashboardOverview {
  revenue: DashboardMetric;
  newOrders: DashboardMetric;
  products: {
    total: number;
    lowStockCount: number;
  };
  customers: DashboardMetric;
  dailyRevenue: DashboardRevenuePoint[];
  recentOrders: DashboardRecentOrder[];
  stockAlerts: DashboardStockAlert[];
  generatedAt: string;
}

export interface DashboardOverviewApiResponse {
  statusCode: number;
  message: string;
  data: DashboardOverview;
}
