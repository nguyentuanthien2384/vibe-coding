'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import { getDashboardOverview } from '../api/dashboard-api';
import { type DashboardOverview as DashboardOverviewType } from '../types/dashboard.types';
import DashboardStatsCards from './dashboard-stats-cards';
import SalesAreaChart from './sales-area-chart';
import RecentDealsTable from './recent-deals-table';

const REFRESH_INTERVAL_MS = 30_000;

function formatDateTime(value: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const DashboardLoading = () => (
  <div className="space-y-8" aria-label="Đang tải dữ liệu dashboard">
    {/* 4 Cards Skeleton */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-2xl bg-white border border-[#E0E0E0]/60 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
        />
      ))}
    </div>

    {/* Area Chart Skeleton */}
    <div className="h-96 animate-pulse rounded-2xl bg-white border border-[#E0E0E0]/60 shadow-[0_4px_20px_rgba(0,0,0,0.05)]" />

    {/* Table Skeleton */}
    <div className="h-80 animate-pulse rounded-2xl bg-white border border-[#E0E0E0]/60 shadow-[0_4px_20px_rgba(0,0,0,0.05)]" />
  </div>
);

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
        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#4880FF] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" /> Tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#202224]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#202224]/60">
            Hiệu quả vận hành và số liệu kinh doanh thực tế của TechBite.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-[#202224]/55">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#00B69B]" />
            Tự cập nhật mỗi 30 giây
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-3 py-2 text-[#202224] transition-colors hover:bg-[#F1F4F9] disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Làm mới
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-[#FFF3D6] bg-white px-4 py-3 text-sm font-semibold text-[#A56B00]">
          Dữ liệu đang hiển thị là lần cập nhật gần nhất: {error}
        </p>
      )}

      {/* 1. Stats Grid (4 Cards: Total User, Total Order, Total Sales, Total Pending) */}
      <DashboardStatsCards
        totalUsers={overview.totalUsers || overview.customers}
        totalOrders={overview.totalOrders || overview.newOrders}
        totalSales={overview.totalSales || overview.revenue}
        totalPending={overview.totalPending}
      />

      {/* 2. Sales Details Area Chart */}
      <SalesAreaChart
        dailyRevenue={overview.dailyRevenue}
        monthlyRevenue={overview.monthlyRevenue}
      />

      {/* 3. Deals Details Table (Recent Orders) */}
      <RecentDealsTable orders={overview.recentOrders} />

      {/* Stock Alerts (If any) */}
      {overview.stockAlerts && overview.stockAlerts.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#E0E0E0]/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#F93C65]" />
              <h2 className="text-lg font-bold text-[#202224]">Cảnh báo sản phẩm sắp hết hàng</h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-[#4880FF] hover:underline"
            >
              Quản lý sản phẩm →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {overview.stockAlerts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}/edit`}
                className="flex items-center justify-between gap-2 rounded-xl border border-[#E0E0E0] p-3 transition-colors hover:bg-[#F5F6FA]"
              >
                <span className="line-clamp-1 text-xs font-bold text-[#202224]">
                  {product.name}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                    product.stock === 0
                      ? 'bg-[#FFDEDF] text-[#D92D4B]'
                      : 'bg-[#FFF3D6] text-[#A56B00]'
                  }`}
                >
                  {product.stock} còn lại
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer Timestamp */}
      <p className="text-right text-xs font-semibold text-[#202224]/45">
        {isRefreshing ? (
          <span className="inline-flex items-center gap-1">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Đang đồng bộ
          </span>
        ) : (
          `Cập nhật lúc ${formatDateTime(overview.generatedAt)}`
        )}
      </p>
    </div>
  );
}
