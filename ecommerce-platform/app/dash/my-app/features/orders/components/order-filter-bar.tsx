'use client';

import React from 'react';
import SearchInput from '@/components/ui/search-input';
import { OrderStatusTabs } from './order-status-tabs';
import { PaymentStatusFilter } from './payment-status-filter';
import { DateRangeFilter } from './date-range-filter';
import { OrderStatus, PaymentStatus } from '../types/order.types';
import { RotateCcw } from 'lucide-react';

export interface OrderFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeOrderStatus: OrderStatus | 'ALL';
  onOrderStatusChange: (status: OrderStatus | 'ALL') => void;
  activePaymentStatus: PaymentStatus | 'ALL';
  onPaymentStatusChange: (status: PaymentStatus | 'ALL') => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  statusCounts?: Record<string, number>;
  onResetFilters: () => void;
}

export const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeOrderStatus,
  onOrderStatusChange,
  activePaymentStatus,
  onPaymentStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  statusCounts,
  onResetFilters,
}) => {
  const hasActiveFilters =
    searchQuery ||
    activeOrderStatus !== 'ALL' ||
    activePaymentStatus !== 'ALL' ||
    startDate ||
    endDate;

  return (
    <div className="space-y-4">
      {/* Upper Status Tabs */}
      <OrderStatusTabs
        activeStatus={activeOrderStatus}
        onChange={onOrderStatusChange}
        counts={statusCounts}
      />

      {/* Filter Controls Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        {/* Search Input */}
        <div className="flex-1 min-w-[260px]">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Tìm theo mã đơn (#ORD-...), tên khách, SĐT, email..."
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          <PaymentStatusFilter
            value={activePaymentStatus}
            onChange={onPaymentStatusChange}
          />

          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
