"use client";

import React from "react";
import { ShippingMethodSelectorProps } from "../../../types/checkout";

export const ShippingMethodSelector: React.FC<ShippingMethodSelectorProps> = ({
  selectedMethod,
  onChange,
  standardFee,
  expressFee,
}) => {
  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

  return (
    <div className="space-y-3">
      <label
        onClick={() => onChange("STANDARD")}
        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
          selectedMethod === "STANDARD"
            ? "border-2 border-orange-600 bg-orange-50/30 shadow-sm"
            : "border border-gray-200 hover:border-orange-300 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="shippingMethod"
            checked={selectedMethod === "STANDARD"}
            onChange={() => onChange("STANDARD")}
            className="text-orange-600 focus:ring-orange-500 h-5 w-5 border-gray-300"
          />
          <div>
            <span className="block font-bold text-slate-900 text-sm md:text-base">
              Giao hàng tiêu chuẩn 🚚
            </span>
            <span className="block text-xs md:text-sm text-slate-500 mt-0.5">
              Dự kiến nhận hàng trong 2-3 ngày làm việc
            </span>
          </div>
        </div>
        <span className="font-extrabold text-slate-900 text-sm md:text-base">
          {formatPrice(standardFee)}
        </span>
      </label>

      <label
        onClick={() => onChange("EXPRESS")}
        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
          selectedMethod === "EXPRESS"
            ? "border-2 border-orange-600 bg-orange-50/30 shadow-sm"
            : "border border-gray-200 hover:border-orange-300 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="shippingMethod"
            checked={selectedMethod === "EXPRESS"}
            onChange={() => onChange("EXPRESS")}
            className="text-orange-600 focus:ring-orange-500 h-5 w-5 border-gray-300"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="block font-bold text-slate-900 text-sm md:text-base">
                Giao hàng Hỏa tốc ⚡
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Siêu Tốc 2H
              </span>
            </div>
            <span className="block text-xs md:text-sm text-slate-500 mt-0.5">
              Nhận ngay trong ngày (chỉ áp dụng TP.HCM & Hà Nội)
            </span>
          </div>
        </div>
        <span className="font-extrabold text-slate-900 text-sm md:text-base">
          {formatPrice(expressFee)}
        </span>
      </label>
    </div>
  );
};
