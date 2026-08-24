import React from 'react';
import { OrderSummary } from '../../types/order.types';
import { Calculator, Tag, Sparkles, Truck } from 'lucide-react';

export interface OrderFinancialSummaryCardProps {
  summary: OrderSummary;
}

export const OrderFinancialSummaryCard: React.FC<OrderFinancialSummaryCardProps> = ({
  summary,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const voucherCode = summary.voucherCode || summary.couponCode;
  const hasVoucherDiscount = summary.discountAmount > 0;
  const hasPointsDiscount = (summary.pointsDiscount ?? 0) > 0 || (summary.pointsUsed ?? 0) > 0;
  const hasPointsEarned = (summary.pointsEarned ?? 0) > 0;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base">
        <div className="p-2 bg-blue-50 text-[#4880FF] rounded-xl">
          <Calculator className="w-5 h-5" />
        </div>
        <h3>Tổng kết tài chính</h3>
      </div>

      <div className="space-y-3 text-sm">
        {/* 1. Subtotal */}
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>Tạm tính tiền hàng</span>
          <span className="font-bold text-slate-800">{formatCurrency(summary.subtotal)}</span>
        </div>

        {/* 2. Shipping Fee */}
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-slate-400" />
            <span>Phí vận chuyển</span>
          </div>
          <span className="font-bold text-slate-800">
            {summary.shippingFee > 0 ? `+${formatCurrency(summary.shippingFee)}` : 'Miễn phí'}
          </span>
        </div>

        {/* 3. Voucher Discount */}
        {hasVoucherDiscount && (
          <div className="flex items-center justify-between text-emerald-600 font-medium bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 flex-shrink-0" />
              <span>
                Mã giảm giá {voucherCode ? `(${voucherCode})` : ''}
              </span>
            </div>
            <span className="font-extrabold">-{formatCurrency(summary.discountAmount)}</span>
          </div>
        )}

        {/* 4. Points Deduction */}
        {hasPointsDiscount && (
          <div className="flex items-center justify-between text-amber-700 font-medium bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⭐️</span>
              <span>
                Trừ điểm tích lũy {summary.pointsUsed ? `(${summary.pointsUsed} điểm)` : ''}
              </span>
            </div>
            <span className="font-extrabold text-amber-800">
              -{formatCurrency(summary.pointsDiscount ?? 0)}
            </span>
          </div>
        )}

        {/* 5. Points Earned preview (if any) */}
        {hasPointsEarned && (
          <div className="flex items-center justify-between text-indigo-600 text-xs font-medium bg-indigo-50/60 px-2.5 py-2 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tích lũy đơn hàng:</span>
            </div>
            <span className="font-bold text-indigo-700">+{summary.pointsEarned} điểm</span>
          </div>
        )}

        {/* Divider */}
        <div className="pt-2 border-t border-gray-100" />

        {/* 6. Total Amount */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="font-extrabold text-slate-900 text-base block">
              Tổng tiền thanh toán
            </span>
            {summary.totalAmount === 0 && (
              <span className="text-xs font-bold text-emerald-600">
                (Đã thanh toán 100% bằng điểm thưởng)
              </span>
            )}
          </div>
          <span className="text-xl font-extrabold text-[#4880FF]">
            {formatCurrency(summary.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
