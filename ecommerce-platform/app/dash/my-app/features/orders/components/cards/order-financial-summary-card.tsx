import React from 'react';
import { OrderSummary } from '../../types/order.types';
import { Calculator, Tag } from 'lucide-react';

export interface OrderFinancialSummaryCardProps {
  summary: OrderSummary;
}

export const OrderFinancialSummaryCard: React.FC<OrderFinancialSummaryCardProps> = ({
  summary,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base">
        <div className="p-2 bg-blue-50 text-[#4880FF] rounded-xl">
          <Calculator className="w-5 h-5" />
        </div>
        <h3>Tổng kết tài chính</h3>
      </div>

      <div className="space-y-3 text-sm">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>Tạm tính hàng</span>
          <span className="font-bold text-slate-800">{formatCurrency(summary.subtotal)}</span>
        </div>

        {/* Shipping Fee */}
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>Phí vận chuyển</span>
          <span className="font-bold text-slate-800">{formatCurrency(summary.shippingFee)}</span>
        </div>

        {/* Voucher Discount */}
        {summary.discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-medium bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              <span>Giảm giá {summary.couponCode ? `(${summary.couponCode})` : ''}</span>
            </div>
            <span className="font-extrabold">-{formatCurrency(summary.discountAmount)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="pt-2 border-t border-gray-100" />

        {/* Total Amount */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-extrabold text-slate-900 text-base">Tổng tiền thanh toán</span>
          <span className="text-xl font-extrabold text-[#4880FF]">
            {formatCurrency(summary.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
