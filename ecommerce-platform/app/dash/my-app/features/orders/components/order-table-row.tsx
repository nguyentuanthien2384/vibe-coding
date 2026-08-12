'use client';

import React from 'react';
import Link from 'next/link';
import { OrderListItem, OrderStatus, PaymentStatus } from '../types/order.types';
import { OrderStatusBadge } from './order-status-badge';
import { PaymentStatusBadge } from './payment-status-badge';
import { QuickStatusDropdown } from './quick-status-dropdown';
import { QuickPaymentStatusDropdown } from './quick-payment-status-dropdown';
import { Eye, FileText } from 'lucide-react';

export interface OrderTableRowProps {
  order: OrderListItem;
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  onUpdatePaymentStatus?: (id: string, newStatus: PaymentStatus) => void;
}

export const OrderTableRow: React.FC<OrderTableRowProps> = ({
  order,
  onUpdateStatus,
  onUpdatePaymentStatus,
}) => {
  const formattedTotal = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(order.totalAmount);

  return (
    <tr className="hover:bg-slate-50/60 transition-colors border-b border-gray-100/80 text-sm">
      {/* Code */}
      <td className="py-4 px-5 font-mono font-bold text-slate-900">
        <Link
          href={`/orders/${order.id}`}
          className="hover:text-[#4880FF] transition-colors inline-block"
        >
          {order.orderCode}
        </Link>
      </td>

      {/* Customer Info */}
      <td className="py-4 px-5">
        <div className="font-semibold text-slate-800">{order.customerName}</div>
        <div className="text-xs text-slate-400 font-normal">{order.customerPhone}</div>
        {order.orderNote && (
          <div
            className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 max-w-[200px] truncate"
            title={`Ghi chú: ${order.orderNote}`}
          >
            <FileText className="w-3 h-3 text-amber-500 flex-shrink-0" />
            <span className="truncate">{order.orderNote}</span>
          </div>
        )}
      </td>

      {/* Item Count */}
      <td className="py-4 px-5 text-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
          {order.itemCount} món
        </span>
      </td>

      {/* Total Amount */}
      <td className="py-4 px-5">
        <span className="font-extrabold text-[#4880FF] text-base">{formattedTotal}</span>
      </td>

      {/* Order Status */}
      <td className="py-4 px-5">
        <OrderStatusBadge status={order.orderStatus} />
      </td>

      {/* Payment Status */}
      <td className="py-4 px-5">
        <div className="flex items-center gap-1">
          <PaymentStatusBadge status={order.paymentStatus} />
          {onUpdatePaymentStatus && (
            <QuickPaymentStatusDropdown
              currentStatus={order.paymentStatus}
              onSelectStatus={(newStatus) => onUpdatePaymentStatus(String(order.id), newStatus)}
            />
          )}
        </div>
      </td>

      {/* Created At */}
      <td className="py-4 px-5 text-slate-500 text-xs font-medium whitespace-nowrap">
        {order.createdAt}
      </td>

      {/* Actions */}
      <td className="py-4 px-5 text-right">
        <div className="flex items-center justify-end gap-1">
          <QuickStatusDropdown
            currentStatus={order.orderStatus}
            onSelectStatus={(newStatus) => onUpdateStatus(String(order.id), newStatus)}
          />

          <Link
            href={`/orders/${order.id}`}
            className="p-2 text-slate-400 hover:text-[#4880FF] hover:bg-blue-50 rounded-xl transition-all inline-flex items-center gap-1 text-xs font-semibold"
            title="Xem chi tiết đơn hàng"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
};

