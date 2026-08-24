"use client";

import React from "react";
import { CheckoutPriceBreakdownProps } from "../../../types/checkout";

export const CheckoutPriceBreakdown: React.FC<CheckoutPriceBreakdownProps> = ({
  subtotal,
  shippingFee,
  discountAmount,
  pointsDiscountAmount = 0,
  total,
}) => {
  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

  const isZeroTotal = total <= 0;

  return (
    <div className="space-y-3 mb-6 text-sm">
      <div className="flex justify-between text-slate-600">
        <span>Tạm tính</span>
        <span className="font-semibold text-slate-900">
          {formatPrice(subtotal)}
        </span>
      </div>

      <div className="flex justify-between text-slate-600">
        <span>Phí vận chuyển</span>
        <span className="font-semibold text-slate-900">
          {shippingFee > 0 ? formatPrice(shippingFee) : "Miễn phí"}
        </span>
      </div>

      {discountAmount > 0 && (
        <div className="flex justify-between text-emerald-600 font-medium">
          <span>Giảm giá voucher</span>
          <span className="font-bold">-{formatPrice(discountAmount)}</span>
        </div>
      )}

      {pointsDiscountAmount > 0 && (
        <div className="flex justify-between text-red-600 font-medium">
          <span className="flex items-center gap-1">
            <span>⭐️</span>
            <span>Trừ điểm tích lũy</span>
          </span>
          <span className="font-bold">-{formatPrice(pointsDiscountAmount)}</span>
        </div>
      )}

      {isZeroTotal && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center text-xs font-bold text-emerald-800 animate-in fade-in duration-300">
          🎉 Bạn đã dùng điểm thanh toán 100% giá trị đơn hàng!
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-3">
        <div>
          <span className="font-extrabold text-slate-900 text-base block">
            Tổng thanh toán
          </span>
          <span className="text-xs text-slate-400 font-medium">
            (Đã bao gồm VAT nếu có)
          </span>
        </div>
        <div className="text-right">
          <span
            className={`text-2xl font-extrabold tracking-tight ${
              isZeroTotal ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatPrice(Math.max(0, total))}
          </span>
        </div>
      </div>
    </div>
  );
};
