import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardMetric,
  DashboardOverviewResponse,
  DashboardRecentOrder,
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
    const dayBeforeYesterdayStart = this.addDays(todayStart, -2);

    const weekStart = this.addDays(todayStart, -6);
    const previousWeekStart = this.addDays(todayStart, -13);

    const monthStart = this.startOfVietnamMonth(now);
    const previousMonthStart = this.startOfPreviousVietnamMonth(now);

    const yearStart = this.startOfVietnamYear(now);
    const yearEnd = this.endOfVietnamYear(now);

    const [
      // 1. Users
      totalUsersCount,
      newUsersToday,
      newUsersYesterday,

      // 2. Orders
      totalOrdersCount,
      ordersThisWeek,
      ordersLastWeek,

      // 3. Sales
      totalSalesRevenue,
      todayRevenue,
      yesterdayRevenue,
      currentMonthRevenue,
      previousMonthRevenue,

      // 4. Pending Orders
      totalPendingOrders,
      pendingOrdersToday,
      pendingOrdersYesterday,

      // Products & Stock
      activeProducts,
      lowStockCount,

      // Raw chart data
      paidOrders30Days,
      paidOrdersYear,

      // Recent orders list
      recentOrdersRaw,
      stockAlerts,
    ] = await Promise.all([
      // Total Users
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

      // Total Orders
      this.prisma.order.count(),
      this.prisma.order.count({
        where: { createdAt: { gte: weekStart } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: previousWeekStart, lt: weekStart } },
      }),

      // Total Sales
      this.sumPaidRevenue(new Date(0), now),
      this.sumPaidRevenue(todayStart, now),
      this.sumPaidRevenue(yesterdayStart, todayStart),
      this.sumPaidRevenue(monthStart, now),
      this.sumPaidRevenue(previousMonthStart, monthStart),

      // Total Pending
      this.prisma.order.count({
        where: { orderStatus: OrderStatus.PENDING },
      }),
      this.prisma.order.count({
        where: {
          orderStatus: OrderStatus.PENDING,
          createdAt: { gte: todayStart },
        },
      }),
      this.prisma.order.count({
        where: {
          orderStatus: OrderStatus.PENDING,
          createdAt: { gte: yesterdayStart, lt: todayStart },
        },
      }),

      // Products
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
      }),

      // Paid Orders for daily chart (last 30 days)
      this.prisma.order.findMany({
        where: {
          paymentStatus: PaymentStatus.PAID,
          paidAt: { gte: this.addDays(todayStart, -29) },
        },
        select: { paidAt: true, totalAmount: true },
      }),

      // Paid Orders for monthly chart (entire year)
      this.prisma.order.findMany({
        where: {
          paymentStatus: PaymentStatus.PAID,
          paidAt: { gte: yearStart, lte: yearEnd },
        },
        select: { paidAt: true, totalAmount: true },
      }),

      // Recent 10 orders with items
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            select: {
              productName: true,
              productImageUrl: true,
              quantity: true,
              itemTotal: true,
            },
          },
        },
      }),

      // Stock alerts
      this.prisma.product.findMany({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
        take: 5,
        orderBy: [{ stock: 'asc' }, { updatedAt: 'desc' }],
        select: { id: true, name: true, stock: true, imageUrl: true },
      }),
    ]);

    // Format recent orders
    const recentOrders: DashboardRecentOrder[] = recentOrdersRaw.map((order) => {
      const firstItem = order.orderItems[0];
      const totalPiece = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const otherCount = Math.max(0, order.orderItems.length - 1);

      const locationParts = [
        order.detailAddress,
        order.wardName,
        order.districtName,
        order.provinceName,
      ].filter(Boolean);

      return {
        id: order.id,
        orderCode: order.orderCode,
        customerName: order.customerName,
        productName: firstItem ? firstItem.productName : 'Đơn hàng không có món',
        productImageUrl: firstItem ? firstItem.productImageUrl : null,
        otherItemsCount: otherCount,
        location: locationParts.length > 0 ? locationParts.join(', ') : 'Chưa có địa chỉ',
        itemCount: totalPiece > 0 ? totalPiece : order.orderItems.length,
        totalAmount: Number(order.totalAmount),
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      };
    });

    // 4 Metrics
    const totalUsersMetric: DashboardMetric = {
      value: totalUsersCount,
      changePercent: this.calculatePercentChange(newUsersToday, newUsersYesterday),
      comparisonLabel: 'so với hôm qua',
    };

    const totalOrdersMetric: DashboardMetric = {
      value: totalOrdersCount,
      changePercent: this.calculatePercentChange(ordersThisWeek, ordersLastWeek),
      comparisonLabel: 'so với tuần trước',
    };

    const totalSalesMetric: DashboardMetric = {
      value: totalSalesRevenue,
      changePercent: this.calculatePercentChange(todayRevenue, yesterdayRevenue),
      comparisonLabel: 'so với hôm qua',
    };

    const totalPendingMetric: DashboardMetric = {
      value: totalPendingOrders,
      changePercent: this.calculatePercentChange(pendingOrdersToday, pendingOrdersYesterday),
      comparisonLabel: 'so với hôm qua',
    };

    return {
      statusCode: 200,
      message: 'Lấy dữ liệu tổng quan dashboard thành công',
      data: {
        // 4 Thẻ chính
        totalUsers: totalUsersMetric,
        totalOrders: totalOrdersMetric,
        totalSales: totalSalesMetric,
        totalPending: totalPendingMetric,

        // Tương thích ngược
        revenue: {
          value: currentMonthRevenue,
          changePercent: this.calculatePercentChange(currentMonthRevenue, previousMonthRevenue),
          comparisonLabel: 'so với tháng trước',
        },
        newOrders: {
          value: ordersThisWeek,
          changePercent: this.calculatePercentChange(ordersThisWeek, ordersLastWeek),
          comparisonLabel: 'so với tuần trước',
        },
        customers: totalUsersMetric,
        products: { total: activeProducts, lowStockCount },

        // Charts
        dailyRevenue: this.buildDailyRevenue(this.addDays(todayStart, -6), paidOrders30Days, 7),
        monthlyRevenue: this.buildMonthlyRevenue(yearStart.getFullYear(), paidOrdersYear),

        // Recent Orders & Stock Alerts
        recentOrders,
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

  private calculatePercentChange(current: number, previous: number): number | null {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  private buildDailyRevenue(
    chartStart: Date,
    orders: Array<{ paidAt: Date | null; totalAmount: { toString(): string } }>,
    daysCount = 7,
  ): DashboardRevenuePoint[] {
    const revenueByDate = new Map<string, { total: number; count: number }>();
    for (const order of orders) {
      if (!order.paidAt) continue;
      const key = this.vietnamDateKey(order.paidAt);
      const existing = revenueByDate.get(key) ?? { total: 0, count: 0 };
      revenueByDate.set(key, {
        total: existing.total + Number(order.totalAmount),
        count: existing.count + 1,
      });
    }

    return Array.from({ length: daysCount }, (_, index) => {
      const date = this.addDays(chartStart, index);
      const dateKey = this.vietnamDateKey(date);
      const data = revenueByDate.get(dateKey) ?? { total: 0, count: 0 };
      return {
        date: dateKey,
        label: new Intl.DateTimeFormat('vi-VN', {
          timeZone: VIETNAM_TIME_ZONE,
          weekday: 'short',
        }).format(date),
        revenue: data.total,
        ordersCount: data.count,
      };
    });
  }

  private buildMonthlyRevenue(
    year: number,
    orders: Array<{ paidAt: Date | null; totalAmount: { toString(): string } }>,
  ): DashboardRevenuePoint[] {
    const revenueByMonth = new Map<number, { total: number; count: number }>();
    for (const order of orders) {
      if (!order.paidAt) continue;
      const dateKey = this.vietnamDateKey(order.paidAt);
      const [orderYear, orderMonth] = dateKey.split('-').map(Number);
      if (orderYear === year) {
        const existing = revenueByMonth.get(orderMonth) ?? { total: 0, count: 0 };
        revenueByMonth.set(orderMonth, {
          total: existing.total + Number(order.totalAmount),
          count: existing.count + 1,
        });
      }
    }

    const monthNames = [
      'Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6',
      'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12',
    ];

    return Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1;
      const data = revenueByMonth.get(monthNumber) ?? { total: 0, count: 0 };
      const monthPadded = String(monthNumber).padStart(2, '0');
      return {
        date: `${year}-${monthPadded}`,
        label: monthNames[index],
        revenue: data.total,
        ordersCount: data.count,
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

  private startOfVietnamYear(date: Date): Date {
    const [year] = this.vietnamDateKey(date).split('-');
    return new Date(`${year}-01-01T00:00:00.000+07:00`);
  }

  private endOfVietnamYear(date: Date): Date {
    const [year] = this.vietnamDateKey(date).split('-');
    return new Date(`${year}-12-31T23:59:59.999+07:00`);
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
