'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  LoaderCircle,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import { getDashboardOverview } from '../api/dashboard-api';
import {
  DashboardMetric,
  DashboardOrderStatus,
  type DashboardOverview as DashboardOverviewType,
  DashboardRecentOrder,
} from '../types/dashboard.types';

const REFRESH_INTERVAL_MS = 30_000;

const orderStatusLabels: Record<DashboardOrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

const orderStatusClasses: Record<DashboardOrderStatus, string> = {
  PENDING: 'bg-[#FFF3D6] text-[#A56B00]',
  CONFIRMED: 'bg-[#E5EFFF] text-[#4880FF]',
  PROCESSING: 'bg-[#F3E8FF] text-[#9333EA]',
  SHIPPING: 'bg-[#E0F2FE] text-[#0284C7]',
  DELIVERED: 'bg-[#D9F7E8] text-[#008A73]',
  CANCELLED: 'bg-[#FFDEDF] text-[#D92D4B]',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

interface MetricCardProps {
  label: string;
  value: string;
  metric?: DashboardMetric;
  description: string;
  icon: typeof WalletCards;
  iconClassName: string;
}

const MetricCard = ({ label, value, metric, description, icon: Icon, iconClassName }: MetricCardProps) => {
  const change = metric?.changePercent ?? null;
  const isPositive = change === null || change >= 0;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ring-1 ring-[#E0E0E0]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#202224]/70">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-[#202224]">{value}</p>
        </div>
        <div className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] ${iconClassName}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs">
        {change !== null && (
          <span className={`flex items-center font-bold ${isPositive ? 'text-[#00B69B]' : 'text-[#F93C65]'}`}>
            {isPositive ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
        <span className="text-[#202224]/55">{description}</span>
      </div>
    </section>
  );
};

const DashboardLoading = () => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4" aria-label="Đang tải dữ liệu dashboard">
    {[0, 1, 2, 3].map((index) => (
      <div key={index} className="h-44 animate-pulse rounded-2xl bg-white ring-1 ring-[#E0E0E0]" />
    ))}
  </div>
);

function OrderStatusBadge({ order }: { order: DashboardRecentOrder }) {
  const isPaymentFailed = order.paymentStatus === 'FAILED' || order.paymentStatus === 'EXPIRED';
  const label = isPaymentFailed ? 'TT thất bại' : orderStatusLabels[order.orderStatus];
  const className = isPaymentFailed ? 'bg-[#FFDEDF] text-[#D92D4B]' : orderStatusClasses[order.orderStatus];

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${className}`}>{label}</span>;
}

export default function DashboardOverview() {
  const [overview, setOverview] = useState<DashboardOverviewType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await getDashboardOverview();
      setOverview(data);
      setError(null);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải dữ liệu dashboard.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const intervalId = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refresh]);

  if (!overview && isRefreshing) return <DashboardLoading />;

  if (!overview) {
    return (
      <div className="rounded-2xl border border-[#FFDEDF] bg-white p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <AlertTriangle className="mx-auto h-9 w-9 text-[#F93C65]" />
        <p className="mt-3 font-bold text-[#202224]">Chưa thể tải dữ liệu tổng quan</p>
        <p className="mt-1 text-sm text-[#202224]/60">{error}</p>
        <button type="button" onClick={() => void refresh()} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#4880FF] px-4 py-2 text-sm font-bold text-white">
          <RefreshCw className="h-4 w-4" /> Tải lại
        </button>
      </div>
    );
  }

  const maximumRevenue = Math.max(...overview.dailyRevenue.map((point: { revenue: number }) => point.revenue), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#202224]">Tổng quan</h1>
          <p className="mt-1 text-sm text-[#202224]/60">Hiệu quả vận hành cửa hàng được đồng bộ từ dữ liệu đơn hàng thực tế.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-[#202224]/55">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#00B69B]" />Tự cập nhật mỗi 30 giây</span>
          <button type="button" onClick={() => void refresh()} disabled={isRefreshing} className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-3 py-2 text-[#202224] transition-colors hover:bg-[#F1F4F9] disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Làm mới
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg border border-[#FFF3D6] bg-white px-4 py-3 text-sm font-semibold text-[#A56B00]">Dữ liệu đang hiển thị là lần cập nhật gần nhất: {error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Doanh thu tháng" value={formatCurrency(overview.revenue.value)} metric={overview.revenue} description="so với tháng trước" icon={WalletCards} iconClassName="bg-[#E5EFFF] text-[#4880FF]" />
        <MetricCard label="Đơn hàng mới" value={formatNumber(overview.newOrders.value)} metric={overview.newOrders} description="so với hôm qua" icon={ShoppingCart} iconClassName="bg-[#FFF3D6] text-[#FEC53D]" />
        <MetricCard label="Sản phẩm đang bán" value={formatNumber(overview.products.total)} description={`${overview.products.lowStockCount} sắp hết hàng`} icon={Package} iconClassName="bg-[#D9F7E8] text-[#4AD991]" />
        <MetricCard label="Khách hàng" value={formatNumber(overview.customers.value)} metric={overview.customers} description="khách mới so với hôm qua" icon={Users} iconClassName="bg-[#F3E8FF] text-[#9333EA]" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ring-1 ring-[#E0E0E0]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#202224]">Doanh thu 7 ngày gần nhất</h2>
              <p className="mt-1 text-sm text-[#202224]/55">Chỉ tính các giao dịch đã thanh toán.</p>
            </div>
            <TrendingUp className="h-6 w-6 text-[#4880FF]" />
          </div>
          <div className="mt-8 flex h-64 items-end justify-between gap-3 border-b border-[#E0E0E0] px-2 sm:gap-5">
            {overview.dailyRevenue.map((point: { date: string; revenue: number; label: string }) => {
              const height = Math.max((point.revenue / maximumRevenue) * 100, point.revenue > 0 ? 8 : 2);
              return (
                <div key={point.date} className="group flex h-full flex-1 flex-col justify-end">
                  <div className="relative flex flex-1 items-end">
                    <div className="w-full rounded-t-lg bg-[#4880FF]/20 transition-colors group-hover:bg-[#4880FF]" style={{ height: `${height}%` }} title={`${point.label}: ${formatCurrency(point.revenue)}`} />
                  </div>
                  <span className="pt-3 text-center text-xs font-semibold text-[#202224]/50">{point.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ring-1 ring-[#E0E0E0]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#202224]">Cảnh báo tồn kho</h2>
              <p className="mt-1 text-sm text-[#202224]/55">Tồn kho từ 5 sản phẩm trở xuống.</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-[#F93C65]" />
          </div>
          <div className="mt-5 space-y-3">
            {overview.stockAlerts.length === 0 ? (
              <p className="rounded-xl bg-[#D9F7E8] px-4 py-5 text-center text-sm font-semibold text-[#008A73]">Tồn kho các sản phẩm đang ổn định.</p>
            ) : overview.stockAlerts.map((product: { id: number; name: string; stock: number }) => (
              <Link key={product.id} href={`/products/${product.id}/edit`} className="flex items-center justify-between gap-3 rounded-xl border border-[#E0E0E0] px-3 py-3 transition-colors hover:bg-[#F5F6FA]">
                <span className="line-clamp-2 text-sm font-bold text-[#202224]">{product.name}</span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${product.stock === 0 ? 'bg-[#FFDEDF] text-[#D92D4B]' : 'bg-[#FFF3D6] text-[#A56B00]'}`}>{product.stock} còn lại</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ring-1 ring-[#E0E0E0]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#202224]">Đơn hàng gần đây</h2>
            <p className="mt-1 text-sm text-[#202224]/55">Cập nhật theo các đơn vừa tạo trong hệ thống.</p>
          </div>
          <Link href="/orders" className="inline-flex items-center gap-1 text-sm font-bold text-[#4880FF] hover:underline">Xem tất cả <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="bg-[#F1F4F9] text-[#202224]">
                <th className="rounded-l-xl px-5 py-4 font-extrabold">Mã đơn</th>
                <th className="px-5 py-4 font-extrabold">Khách hàng</th>
                <th className="px-5 py-4 font-extrabold">Thời gian</th>
                <th className="px-5 py-4 font-extrabold">Số món</th>
                <th className="px-5 py-4 font-extrabold">Tổng tiền</th>
                <th className="rounded-r-xl px-5 py-4 font-extrabold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {overview.recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center font-semibold text-[#202224]/50">Chưa có đơn hàng nào.</td></tr>
              ) : overview.recentOrders.map((order: DashboardRecentOrder) => (
                <tr key={order.id} className="border-b border-[#E0E0E0] last:border-0 hover:bg-[#F5F6FA]">
                  <td className="px-5 py-4"><Link href={`/orders/${order.id}`} className="font-extrabold text-[#4880FF] hover:underline">{order.orderCode}</Link></td>
                  <td className="px-5 py-4 font-semibold text-[#202224]/80">{order.customerName}</td>
                  <td className="px-5 py-4 text-[#202224]/65"><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{formatDateTime(order.createdAt)}</span></td>
                  <td className="px-5 py-4 font-semibold text-[#202224]/80">{order.itemCount}</td>
                  <td className="px-5 py-4 font-extrabold text-[#202224]">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-4"><OrderStatusBadge order={order} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-right text-xs font-semibold text-[#202224]/45">{isRefreshing ? <span className="inline-flex items-center gap-1"><LoaderCircle className="h-3.5 w-3.5 animate-spin" />Đang đồng bộ</span> : `Cập nhật lúc ${formatDateTime(overview.generatedAt)}`}</p>
    </div>
  );
}
