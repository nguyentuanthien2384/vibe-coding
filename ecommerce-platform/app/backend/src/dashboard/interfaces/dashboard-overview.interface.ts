import { OrderStatus, PaymentStatus } from '@prisma/client';

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
  generatedAt: Date;
}

export interface DashboardOverviewResponse {
  statusCode: number;
  message: string;
  data: DashboardOverviewData;
}
