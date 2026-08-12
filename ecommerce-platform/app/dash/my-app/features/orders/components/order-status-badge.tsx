import React from 'react';
import { OrderStatus } from '../types/order.types';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-50 text-amber-600 border border-amber-200',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    className: 'bg-blue-50 text-blue-600 border border-blue-200',
  },
  PROCESSING: {
    label: 'Đang xử lý',
    className: 'bg-purple-50 text-purple-600 border border-purple-200',
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    className: 'bg-sky-50 text-sky-600 border border-sky-200',
  },
  DELIVERED: {
    label: 'Đã giao',
    className: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-rose-50 text-rose-600 border border-rose-200',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs whitespace-nowrap transition-colors ${config.className} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {config.label}
    </span>
  );
};
