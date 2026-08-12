import React from 'react';
import { PaymentStatus } from '../types/order.types';

export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Chưa thanh toán',
    className: 'bg-amber-100 text-amber-700',
  },
  UNPAID: {
    label: 'Chưa thanh toán',
    className: 'bg-red-100 text-red-700',
  },
  PAID: {
    label: 'Đã thanh toán',
    className: 'bg-emerald-100 text-emerald-700',
  },
  FAILED: {
    label: 'Thanh toán thất bại',
    className: 'bg-rose-100 text-rose-700',
  },
  EXPIRED: {
    label: 'Hết hạn thanh toán',
    className: 'bg-slate-100 text-slate-600',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    className: 'bg-purple-100 text-purple-700',
  },
};

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className = '' }) => {
  const config = PAYMENT_CONFIG[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};
