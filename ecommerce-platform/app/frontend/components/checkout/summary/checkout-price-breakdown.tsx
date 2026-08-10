"use client";

import React from "react";
import { CheckoutPriceBreakdownProps } from "../../../types/checkout";

export const CheckoutPriceBreakdown: React.FC<CheckoutPriceBreakdownProps> = ({
  subtotal,
  shippingFee,
  discountAmount,
  total,
}) => {
  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

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

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-3">
        <div>
          <span className="font-extrabold text-slate-900 text-base block">
            Tổng thanh toán
          </span>
          <span className="text-xs text-slate-400 font-medium">
            (Đã bao gồm VAT nếu có)
          </span>
        </div>
        <span className="text-2xl font-extrabold text-red-600 tracking-tight">
          {formatPrice(Math.max(0, total))}
        </span>
      </div>
    </div>
  );
};
