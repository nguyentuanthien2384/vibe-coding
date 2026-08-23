'use client';

import React from 'react';
import { OrderListItem, OrderStatus, PaymentStatus } from '../types/order.types';
import { OrderTableHeader } from './order-table-header';
import { OrderTableRow } from './order-table-row';
import { ShoppingBag } from 'lucide-react';

export interface OrderTableProps {
  orders: OrderListItem[];
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  onUpdatePaymentStatus?: (id: string, newStatus: PaymentStatus) => void;
  onQuickConfirm?: (id: string, orderCode: string) => void;
  isLoading?: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onQuickConfirm,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-100 rounded-2xl w-full" />
          <div className="h-14 bg-slate-50 rounded-2xl w-full" />
          <div className="h-14 bg-slate-50 rounded-2xl w-full" />
          <div className="h-14 bg-slate-50 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-50 text-[#4880FF] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Không tìm thấy đơn hàng nào</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Không có đơn hàng nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl custom-shadow overflow-hidden border border-gray-50">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <OrderTableHeader />
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <OrderTableRow
                key={order.id}
                order={order}
                onUpdateStatus={onUpdateStatus}
                onUpdatePaymentStatus={onUpdatePaymentStatus}
                onQuickConfirm={onQuickConfirm}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

