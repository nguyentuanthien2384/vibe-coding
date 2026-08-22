import { Clock, LucideIcon, Package, ShoppingCart, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { DashboardMetric } from '../types/dashboard.types';

interface StatsCardProps {
  label: string;
  value: string;
  metric?: DashboardMetric;
  defaultSubtext: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconTextClass: string;
}

function StatsCard({
  label,
  value,
  metric,
  defaultSubtext,
  icon: Icon,
  iconBgClass,
  iconTextClass,
}: StatsCardProps) {
  const change = metric?.changePercent ?? null;
  const isPositive = change === null || change >= 0;
  const subtext = metric?.comparisonLabel || defaultSubtext;

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#E0E0E0]/60 transition-transform hover:-translate-y-0.5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#202224] opacity-70">{label}</p>
          <h3 className="mt-1 text-2xl font-bold text-[#202224]">{value}</h3>
        </div>
        <div
          className={`flex h-[60px] w-[60px] items-center justify-center rounded-[18px] ${iconBgClass} ${iconTextClass}`}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>
      <div className="flex items-center gap-1 text-[12px]">
        {change !== null ? (
          <>
            <span
              className={`flex items-center font-bold ${
                isPositive ? 'text-[#00B69B]' : 'text-[#F93C65]'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4" />
              )}
              {isPositive ? '+' : ''}
              {change}%
            </span>
            <span className="text-[#202224] opacity-60">
              {isPositive ? 'Tăng' : 'Giảm'} {subtext}
            </span>
          </>
        ) : (
          <span className="text-[#202224] opacity-60">{subtext}</span>
        )}
      </div>
    </div>
  );
}

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

interface DashboardStatsCardsProps {
  totalUsers?: DashboardMetric;
  totalOrders?: DashboardMetric;
  totalSales?: DashboardMetric;
  totalPending?: DashboardMetric;
}

export default function DashboardStatsCards({
  totalUsers,
  totalOrders,
  totalSales,
  totalPending,
}: DashboardStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Total User */}
      <StatsCard
        label="Total User"
        value={formatNumber(totalUsers?.value ?? 0)}
        metric={totalUsers}
        defaultSubtext="so với hôm qua"
        icon={Users}
        iconBgClass="bg-[#E5EFFF]"
        iconTextClass="text-[#4880FF]"
      />

      {/* Card 2: Total Order */}
      <StatsCard
        label="Total Order"
        value={formatNumber(totalOrders?.value ?? 0)}
        metric={totalOrders}
        defaultSubtext="so với tuần trước"
        icon={Package}
        iconBgClass="bg-[#FFF3D6]"
        iconTextClass="text-[#FEC53D]"
      />

      {/* Card 3: Total Sales */}
      <StatsCard
        label="Total Sales"
        value={formatCurrency(totalSales?.value ?? 0)}
        metric={totalSales}
        defaultSubtext="so với hôm qua"
        icon={ShoppingCart}
        iconBgClass="bg-[#D9F7E8]"
        iconTextClass="text-[#4AD991]"
      />

      {/* Card 4: Total Pending */}
      <StatsCard
        label="Total Pending"
        value={formatNumber(totalPending?.value ?? 0)}
        metric={totalPending}
        defaultSubtext="so với hôm qua"
        icon={Clock}
        iconBgClass="bg-[#FFDEDF]"
        iconTextClass="text-[#F93C65]"
      />
    </div>
  );
}
