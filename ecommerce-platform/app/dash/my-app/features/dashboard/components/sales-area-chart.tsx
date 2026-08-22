'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { DashboardRevenuePoint } from '../types/dashboard.types';

type TimeRangeFilter = '7_DAYS' | '30_DAYS' | '12_MONTHS';

interface SalesAreaChartProps {
  dailyRevenue?: DashboardRevenuePoint[];
  monthlyRevenue?: DashboardRevenuePoint[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }
  return `${value}`;
}

export default function SalesAreaChart({
  dailyRevenue = [],
  monthlyRevenue = [],
}: SalesAreaChartProps) {
  const [filter, setFilter] = useState<TimeRangeFilter>('7_DAYS');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Active data points based on filter
  const chartData: DashboardRevenuePoint[] = useMemo(() => {
    if (filter === '12_MONTHS' && monthlyRevenue.length > 0) {
      return monthlyRevenue;
    }
    if (dailyRevenue.length > 0) {
      return dailyRevenue;
    }
    // Fallback sample data if empty
    return [
      { date: '1', label: 'T2', revenue: 5000000 },
      { date: '2', label: 'T3', revenue: 12000000 },
      { date: '3', label: 'T4', revenue: 8000000 },
      { date: '4', label: 'T5', revenue: 24000000 },
      { date: '5', label: 'T6', revenue: 16000000 },
      { date: '6', label: 'T7', revenue: 45000000 },
      { date: '7', label: 'CN', revenue: 32000000 },
    ];
  }, [filter, dailyRevenue, monthlyRevenue]);

  const filterLabels: Record<TimeRangeFilter, string> = {
    '7_DAYS': '7 ngày qua',
    '30_DAYS': '30 ngày qua',
    '12_MONTHS': '12 tháng trong năm',
  };

  // Dimensions
  const svgWidth = 1000;
  const svgHeight = 320;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 40;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxRevenue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.revenue), 100_000);
    // Round up to nearest nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil(max / magnitude) * magnitude;
  }, [chartData]);

  // Generate Y-axis grid values (5 ticks)
  const yTicks = useMemo(() => {
    const ticks = [];
    for (let i = 4; i >= 0; i--) {
      const val = (maxRevenue / 4) * i;
      ticks.push(val);
    }
    return ticks;
  }, [maxRevenue]);

  // Compute coordinate points
  const points = useMemo(() => {
    const count = chartData.length;
    if (count === 0) return [];
    return chartData.map((item, index) => {
      const x =
        count === 1
          ? paddingLeft + chartWidth / 2
          : paddingLeft + (index / (count - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (item.revenue / maxRevenue) * chartHeight;
      return { x, y, ...item };
    });
  }, [chartData, chartWidth, chartHeight, paddingLeft, paddingTop, maxRevenue]);

  // Construct smooth cubic Bezier path
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };
    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`,
        areaPath: `M ${p.x - 20} ${paddingTop + chartHeight} L ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y} L ${p.x + 20} ${paddingTop + chartHeight} Z`,
      };
    }

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i !== points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const baselineY = paddingTop + chartHeight;
    const area = `${d} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

    return { linePath: d, areaPath: area };
  }, [points, paddingTop, chartHeight]);

  // Total sales in this period
  const totalPeriodSales = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.revenue, 0);
  }, [chartData]);

  // Default active point or hovered point
  const activeIndex = hoveredIndex !== null ? hoveredIndex : points.length > 0 ? points.length - 1 : null;
  const activePoint = activeIndex !== null && points[activeIndex] ? points[activeIndex] : null;

  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#E0E0E0]/60">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#202224]">Sales Details</h3>
            <span className="inline-flex items-center rounded-full bg-[#E5EFFF] px-2.5 py-0.5 text-xs font-bold text-[#4880FF]">
              <TrendingUp className="mr-1 h-3 w-3" />
              Tổng: {formatCurrency(totalPeriodSales)}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#202224]/55">
            Biểu đồ dạng area thể hiện doanh thu bán hàng thực tế đã thanh toán.
          </p>
        </div>

        {/* Dropdown Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center bg-[#FCFDFD] border border-[#D5D5D5] rounded-lg px-4 py-2 gap-2 cursor-pointer hover:bg-[#F1F4F9] transition-colors text-sm font-semibold text-[#202224]"
          >
            <span>{filterLabels[filter]}</span>
            <ChevronDown className={`w-4 h-4 text-[#202224]/60 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-[#E0E0E0] bg-white py-1.5 shadow-lg z-20">
              {(['7_DAYS', '30_DAYS', '12_MONTHS'] as TimeRangeFilter[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setFilter(key);
                    setIsDropdownOpen(false);
                    setHoveredIndex(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                    filter === key
                      ? 'bg-[#E5EFFF] text-[#4880FF]'
                      : 'text-[#202224] hover:bg-[#F1F4F9]'
                  }`}
                >
                  {filterLabels[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Area Chart Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-[280px] md:h-[320px] overflow-visible"
        >
          <defs>
            {/* Smooth Blue Gradient */}
            <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4880FF" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#4880FF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#4880FF" stopOpacity="0.0" />
            </linearGradient>

            {/* Drop Shadow for Tooltip */}
            <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#4880FF" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Grid lines & Y Axis labels */}
          {yTicks.map((val, idx) => {
            const y = paddingTop + (idx / 4) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#E0E0E0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[#202224]/50 text-[11px] font-semibold"
                >
                  {formatCompactNumber(val)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#salesAreaGradient)"
              className="transition-all duration-300"
            />
          )}

          {/* Smooth Stroke Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#4880FF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Vertical Guideline on active/hovered point */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingTop}
              x2={activePoint.x}
              y2={paddingTop + chartHeight}
              stroke="#4880FF"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="opacity-70"
            />
          )}

          {/* Interactive Data Points & Hover Targets */}
          {points.map((p, idx) => {
            const isHovered = activeIndex === idx;
            return (
              <g key={idx} className="cursor-pointer">
                {/* Large transparent hover hitbox */}
                <rect
                  x={p.x - 20}
                  y={paddingTop}
                  width="40"
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />

                {/* Point Circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#4880FF' : '#FFFFFF'}
                  stroke="#4880FF"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Active Tooltip Pill (Styled exactly like Figma) */}
          {activePoint && (
            <g
              transform={`translate(${Math.min(
                Math.max(activePoint.x, paddingLeft + 50),
                svgWidth - paddingRight - 50
              )}, ${Math.max(activePoint.y - 14, paddingTop + 20)})`}
              className="pointer-events-none transition-transform duration-150"
            >
              {/* Tooltip background pill */}
              <rect
                x="-64"
                y="-32"
                width="128"
                height="32"
                rx="8"
                fill="#4880FF"
                filter="url(#tooltipShadow)"
              />
              {/* Small arrow triangle pointing down */}
              <polygon
                points="-5,0 5,0 0,5"
                fill="#4880FF"
              />
              <text
                x="0"
                y="-11"
                textAnchor="middle"
                fill="#FFFFFF"
                className="text-[12px] font-extrabold tracking-wide"
              >
                {formatCurrency(activePoint.revenue)}
              </text>
            </g>
          )}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={svgHeight - 10}
              textAnchor="middle"
              className={`text-[12px] font-semibold transition-colors ${
                activeIndex === idx ? 'fill-[#4880FF] font-bold' : 'fill-[#202224]/60'
              }`}
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
