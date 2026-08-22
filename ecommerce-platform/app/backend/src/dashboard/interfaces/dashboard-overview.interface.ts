import { OrderStatus, PaymentStatus } from '@prisma/client';

export interface DashboardMetric {
  value: number;
  changePercent: number | null;
  comparisonLabel?: string;
}

export interface DashboardRevenuePoint {
  date: string;
  label: string;
  revenue: number;
  ordersCount?: number;
}

export interface DashboardRecentOrder {
  id: number;
  orderCode: string;
  customerName: string;
  productName: string;
  productImageUrl: string | null;
  otherItemsCount: number;
  location: string;
  itemCount: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

export interface DashboardStockAlert {
  id: number;
  name: string;
  stock: number;
  imageUrl: string;
}

export interface DashboardOverviewData {
  // 4 Thẻ thống kê chính theo Figma
  totalUsers: DashboardMetric;
  totalOrders: DashboardMetric;
  totalSales: DashboardMetric;
  totalPending: DashboardMetric;

  // Tương thích ngược
  revenue: DashboardMetric;
  newOrders: DashboardMetric;
  customers: DashboardMetric;
  products: {
    total: number;
    lowStockCount: number;
  };

  // Biểu đồ doanh thu (ngày & tháng)
  dailyRevenue: DashboardRevenuePoint[];
  monthlyRevenue: DashboardRevenuePoint[];

  // Bảng đơn hàng gần đây (Deals Details)
  recentOrders: DashboardRecentOrder[];
  stockAlerts: DashboardStockAlert[];
  generatedAt: Date;
}

export interface DashboardOverviewResponse {
  statusCode: number;
  message: string;
  data: DashboardOverviewData;
}
