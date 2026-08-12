import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { OrderStatusBadge } from './order-status-badge';
import { PaymentStatusBadge } from './payment-status-badge';
import { OrderStatus, PaymentStatus } from '../types/order.types';
import { PrintInvoiceButton } from './print-invoice-button';

export interface OrderDetailHeaderProps {
  orderCode: string;
  createdAt: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  onChangeStatusClick: () => void;
}

export const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({
  orderCode,
  createdAt,
  orderStatus,
  paymentStatus,
  onChangeStatusClick,
}) => {
  return (
    <div className="space-y-4">
      {/* Top navigation row */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#4880FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách đơn hàng</span>
        </Link>
      </div>

      {/* Main title bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {orderCode}
            </h1>
            <OrderStatusBadge status={orderStatus} />
            <PaymentStatusBadge status={paymentStatus} />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Ngày khởi tạo: {createdAt}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={onChangeStatusClick}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
          >
            Đổi trạng thái
          </button>
          <PrintInvoiceButton orderCode={orderCode} />
        </div>
      </div>
    </div>
  );
};
