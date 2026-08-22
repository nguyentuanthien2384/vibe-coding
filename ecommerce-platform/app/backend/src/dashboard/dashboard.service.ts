import { Injectable } from '@nestjs/common';
import { PaymentStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardMetric,
  DashboardOverviewResponse,
  DashboardRevenuePoint,
} from './interfaces/dashboard-overview.interface';

const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<DashboardOverviewResponse> {
    const now = new Date();
    const todayStart = this.startOfVietnamDay(now);
    const yesterdayStart = this.addDays(todayStart, -1);
    const monthStart = this.startOfVietnamMonth(now);
    const previousMonthStart = this.startOfPreviousVietnamMonth(now);
    const chartStart = this.addDays(todayStart, -6);

    const [
      currentMonthRevenue,
      previousMonthRevenue,
      todayOrders,
      yesterdayOrders,
      activeProducts,
      lowStockCount,
      totalCustomers,
      newCustomersToday,
      newCustomersYesterday,
      paidOrders,
      recentOrders,
      stockAlerts,
    ] = await Promise.all([
      this.sumPaidRevenue(monthStart, now),
      this.sumPaidRevenue(previousMonthStart, monthStart),
      this.prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.order.count({
        where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
      }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
      }),
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.user.count({
        where: { role: Role.CUSTOMER, createdAt: { gte: todayStart } },
      }),
      this.prisma.user.count({
        where: {
          role: Role.CUSTOMER,
          createdAt: { gte: yesterdayStart, lt: todayStart },
        },
      }),
      this.prisma.order.findMany({
        where: {
          paymentStatus: PaymentStatus.PAID,
          paidAt: { gte: chartStart },
        },
        select: { paidAt: true, totalAmount: true },
      }),
      this.prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { orderItems: true } } },
      }),
      this.prisma.product.findMany({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
        take: 5,
        orderBy: [{ stock: 'asc' }, { updatedAt: 'desc' }],
        select: { id: true, name: true, stock: true, imageUrl: true },
      }),
    ]);

    return {
      statusCode: 200,
      message: 'Lấy dữ liệu tổng quan dashboard thành công',
      data: {
        revenue: this.metric(currentMonthRevenue, previousMonthRevenue),
        newOrders: this.metric(todayOrders, yesterdayOrders),
        products: { total: activeProducts, lowStockCount },
        customers: this.metric(newCustomersToday, newCustomersYesterday, totalCustomers),
        dailyRevenue: this.buildDailyRevenue(chartStart, paidOrders),
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderCode: order.orderCode,
          customerName: order.customerName,
          itemCount: order._count.orderItems,
          totalAmount: Number(order.totalAmount),
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
        })),
        stockAlerts,
        generatedAt: now,
      },
    };
  }

  private async sumPaidRevenue(start: Date, end: Date): Promise<number> {
    const result = await this.prisma.order.aggregate({
      where: {
        paymentStatus: PaymentStatus.PAID,
        paidAt: { gte: start, lt: end },
      },
      _sum: { totalAmount: true },
    });
    return Number(result._sum.totalAmount ?? 0);
  }

  private metric(current: number, previous: number, value = current): DashboardMetric {
    if (previous === 0) {
      return { value, changePercent: current === 0 ? 0 : 100 };
    }
    return {
      value,
      changePercent: Number((((current - previous) / previous) * 100).toFixed(1)),
    };
  }

  private buildDailyRevenue(
    chartStart: Date,
    orders: Array<{ paidAt: Date | null; totalAmount: { toString(): string } }>,
  ): DashboardRevenuePoint[] {
    const revenueByDate = new Map<string, number>();
    for (const order of orders) {
      if (!order.paidAt) continue;
      const key = this.vietnamDateKey(order.paidAt);
      revenueByDate.set(key, (revenueByDate.get(key) ?? 0) + Number(order.totalAmount));
    }

    return Array.from({ length: 7 }, (_, index) => {
      const date = this.addDays(chartStart, index);
      const dateKey = this.vietnamDateKey(date);
      return {
        date: dateKey,
        label: new Intl.DateTimeFormat('vi-VN', {
          timeZone: VIETNAM_TIME_ZONE,
          weekday: 'short',
        }).format(date),
        revenue: revenueByDate.get(dateKey) ?? 0,
      };
    });
  }

  private startOfVietnamDay(date: Date): Date {
    return new Date(`${this.vietnamDateKey(date)}T00:00:00.000+07:00`);
  }

  private startOfVietnamMonth(date: Date): Date {
    const [year, month] = this.vietnamDateKey(date).split('-');
    return new Date(`${year}-${month}-01T00:00:00.000+07:00`);
  }

  private startOfPreviousVietnamMonth(date: Date): Date {
    const [yearText, monthText] = this.vietnamDateKey(date).split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const previousMonth = month === 1 ? 12 : month - 1;
    const previousYear = month === 1 ? year - 1 : year;
    return new Date(
      `${previousYear}-${String(previousMonth).padStart(2, '0')}-01T00:00:00.000+07:00`,
    );
  }

  private vietnamDateKey(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: VIETNAM_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes): string =>
      parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
}
