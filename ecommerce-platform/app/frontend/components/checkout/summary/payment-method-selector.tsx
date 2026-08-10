"use client";

import React from "react";
import { PaymentMethodSelectorProps } from "../../../types/checkout";

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onChange,
}) => {
  return (
    <div className="mb-6 space-y-3">
      <h4 className="font-extrabold text-slate-900 text-sm md:text-base">
        Phương thức thanh toán
      </h4>

      <label
        onClick={() => onChange("QR_CODE")}
        className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all ${
          selectedMethod === "QR_CODE"
            ? "border-2 border-orange-600 bg-orange-50/30 shadow-sm"
            : "border border-gray-200 hover:border-orange-300 bg-white"
        }`}
      >
        <input
          type="radio"
          name="paymentMethod"
          checked={selectedMethod === "QR_CODE"}
          onChange={() => onChange("QR_CODE")}
          className="text-orange-600 focus:ring-orange-500 h-5 w-5 border-gray-300"
        />
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 font-bold">
          📱
        </div>
        <div>
          <span className="font-bold text-slate-900 text-sm block">
            Thanh toán qua QR Code (VietQR / Banking)
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            Xác nhận đơn hàng tự động 24/7
          </span>
        </div>
      </label>

      <label
        onClick={() => onChange("COD")}
        className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all ${
          selectedMethod === "COD"
            ? "border-2 border-orange-600 bg-orange-50/30 shadow-sm"
            : "border border-gray-200 hover:border-orange-300 bg-white"
        }`}
      >
        <input
          type="radio"
          name="paymentMethod"
          checked={selectedMethod === "COD"}
          onChange={() => onChange("COD")}
          className="text-orange-600 focus:ring-orange-500 h-5 w-5 border-gray-300"
        />
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-bold">
          💵
        </div>
        <div>
          <span className="font-bold text-slate-900 text-sm block">
            Thanh toán khi nhận hàng (COD)
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            Thanh toán tiền mặt trực tiếp cho shipper
          </span>
        </div>
      </label>
    </div>
  );
};
