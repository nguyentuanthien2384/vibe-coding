'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown, Package, ShoppingBag } from 'lucide-react';
import { getImageUrl } from '../../../lib/image-url';
import {
  DashboardOrderStatus,
  DashboardRecentOrder,
} from '../types/dashboard.types';

interface RecentDealsTableProps {
  orders?: DashboardRecentOrder[];
}

const orderStatusConfig: Record<
  DashboardOrderStatus,
  { label: string; className: string }
> = {
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-[#00B69B] text-white',
  },
  PENDING: {
    label: 'Pending',
    className: 'bg-[#FCBE2D] text-white',
  },
  CANCELLED: {
    label: 'Rejected',
    className: 'bg-[#F93C65] text-white',
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-[#9333EA] text-white',
  },
  SHIPPING: {
    label: 'Shipping',
    className: 'bg-[#0284C7] text-white',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-[#4880FF] text-white',
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export default function RecentDealsTable({ orders = [] }: RecentDealsTableProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Month options for filter dropdown
  const monthOptions = [
    { value: 'ALL', label: 'Tất cả tháng' },
    { value: '1', label: 'Tháng 1' },
    { value: '2', label: 'Tháng 2' },
    { value: '3', label: 'Tháng 3' },
    { value: '4', label: 'Tháng 4' },
    { value: '5', label: 'Tháng 5' },
    { value: '6', label: 'Tháng 6' },
    { value: '7', label: 'Tháng 7' },
    { value: '8', label: 'Tháng 8' },
    { value: '9', label: 'Tháng 9' },
    { value: '10', label: 'Tháng 10' },
    { value: '11', label: 'Tháng 11' },
    { value: '12', label: 'Tháng 12' },
  ];

  const currentMonthLabel =
    monthOptions.find((m) => m.value === selectedMonth)?.label || 'Tất cả tháng';

  const filteredOrders = useMemo(() => {
    if (selectedMonth === 'ALL') return orders;
    const monthNum = parseInt(selectedMonth, 10);
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() + 1 === monthNum;
    });
  }, [orders, selectedMonth]);

  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#E0E0E0]/60">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#202224]">Deals Details</h3>
            <span className="rounded-full bg-[#F1F4F9] px-2.5 py-0.5 text-xs font-bold text-[#202224]/70">
              {filteredOrders.length} đơn gần nhất
            </span>
          </div>
          <p className="mt-1 text-xs text-[#202224]/55">
            Danh sách các đơn hàng mới nhất được đồng bộ thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center bg-[#FCFDFD] border border-[#D5D5D5] rounded-lg px-4 py-2 gap-2 cursor-pointer hover:bg-[#F1F4F9] transition-colors text-sm font-semibold text-[#202224]"
            >
              <span>{currentMonthLabel}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#202224]/60 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 max-h-56 overflow-y-auto rounded-xl border border-[#E0E0E0] bg-white py-1.5 shadow-lg z-20">
                {monthOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(opt.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                      selectedMonth === opt.value
                        ? 'bg-[#E5EFFF] text-[#4880FF]'
                        : 'text-[#202224] hover:bg-[#F1F4F9]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View All Link */}
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#4880FF] hover:underline"
          >
            Xem tất cả <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F1F4F9] rounded-xl overflow-hidden text-[#202224]">
              <th className="py-4 px-6 text-sm font-bold first:rounded-l-xl">Product Name</th>
              <th className="py-4 px-6 text-sm font-bold">Location</th>
              <th className="py-4 px-6 text-sm font-bold">Date - Time</th>
              <th className="py-4 px-6 text-sm font-bold">Piece</th>
              <th className="py-4 px-6 text-sm font-bold">Amount</th>
              <th className="py-4 px-6 text-sm font-bold last:rounded-r-xl">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm font-semibold text-[#202224]/50">
                  <Package className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  Chưa có đơn hàng nào trong khoảng thời gian đã chọn.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = orderStatusConfig[order.orderStatus] || {
                  label: order.orderStatus,
                  className: 'bg-gray-500 text-white',
                };
                const imageUrl = order.productImageUrl ? getImageUrl(order.productImageUrl) : '';

                return (
                  <tr
                    key={order.id}
                    className="border-b border-[#E0E0E0] last:border-0 hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Product Name & Thumbnail */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-[#E0E0E0]/60">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={order.productName}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/orders/${order.id}`}
                            className="font-bold text-[#202224] hover:text-[#4880FF] transition-colors line-clamp-1 block"
                            title={order.productName}
                          >
                            {order.productName}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-[#4880FF]">
                              #{order.orderCode}
                            </span>
                            {order.otherItemsCount > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                +{order.otherItemsCount} món khác
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6 font-semibold text-[#202224] opacity-80 max-w-[220px]">
                      <span className="line-clamp-2" title={order.location}>
                        {order.location}
                      </span>
                    </td>

                    {/* Date - Time */}
                    <td className="py-4 px-6 font-semibold text-[#202224] opacity-80 whitespace-nowrap">
                      {formatDateTime(order.createdAt)}
                    </td>

                    {/* Piece */}
                    <td className="py-4 px-6 font-bold text-[#202224] opacity-80">
                      {order.itemCount}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 font-extrabold text-[#202224] whitespace-nowrap">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
