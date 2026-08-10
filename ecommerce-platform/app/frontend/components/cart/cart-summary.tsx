"use client";

import React, { useState } from "react";
import { CartSummaryProps } from "../../types/cart";

export const CartSummary: React.FC<CartSummaryProps> = ({
  summary,
  onCheckout,
  isSubmitting = false,
  freeShippingThreshold = 100000,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  // Calculate freeship progress
  const progressPercent = Math.min(
    100,
    Math.round((summary.subtotal / freeShippingThreshold) * 100)
  );
  const amountNeededForFreeship = Math.max(
    0,
    freeShippingThreshold - summary.subtotal
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (couponCode.toUpperCase() === "TECHBITE" || couponCode.toUpperCase() === "DEADLINE") {
      setAppliedCoupon(couponCode.toUpperCase());
      setCouponError(null);
    } else {
      setCouponError("Mã không hợp lệ hoặc đã hết hạn!");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  return (
    <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shadow-xl shadow-slate-900/5 space-y-4 shrink-0">
      {/* Freeship Progress Bar */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-900">
            <span>🚚</span>
            {amountNeededForFreeship === 0 ? (
              <span className="text-green-600">Bạn đã đủ điều kiện FREESHIP!</span>
            ) : (
              <span>
                Mua thêm{" "}
                <span className="text-orange-600 font-extrabold">
                  {formatPrice(amountNeededForFreeship)}
                </span>{" "}
                để FREESHIP
              </span>
            )}
          </span>
          <span className="text-orange-600 font-extrabold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-orange-200/60 rounded-full h-2 overflow-hidden">
          <div
            className="bg-orange-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Coupon Code Section */}
      {!appliedCoupon ? (
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập mã giảm giá (ví dụ: TECHBITE)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 uppercase font-semibold placeholder:normal-case placeholder:font-normal"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            Áp dụng
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-green-700">
            <span>🎟️</span>
            <span>Mã {appliedCoupon} (-15.000đ)</span>
          </div>
          <button
            onClick={removeCoupon}
            className="text-slate-400 hover:text-red-600 text-xs font-bold"
          >
            Xóa
          </button>
        </div>
      )}
      {couponError && (
        <p className="text-[11px] font-semibold text-red-500 -mt-2">{couponError}</p>
      )}

      {/* Subtotal & Totals Break Down */}
      <div className="space-y-2 text-xs text-slate-600 pt-1">
        <div className="flex justify-between items-center">
          <span>Tạm tính</span>
          <span className="font-bold text-slate-900">{formatPrice(summary.subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Phí giao hàng</span>
          {summary.shippingFee === 0 || amountNeededForFreeship === 0 ? (
            <span className="font-extrabold text-green-600">Miễn phí</span>
          ) : (
            <span className="font-bold text-slate-900">
              {formatPrice(summary.shippingFee)}
            </span>
          )}
        </div>
        {appliedCoupon && (
          <div className="flex justify-between items-center text-green-600">
            <span>Giảm giá Voucher</span>
            <span className="font-bold">-15.000đ</span>
          </div>
        )}
        <hr className="border-slate-100 my-2" />
        <div className="flex justify-between items-center text-sm font-extrabold text-slate-900">
          <span>Tổng tiền thanh toán</span>
          <span className="text-lg text-red-600 font-extrabold">
            {formatPrice(
              Math.max(
                0,
                summary.subtotal +
                  (amountNeededForFreeship === 0 ? 0 : summary.shippingFee) -
                  (appliedCoupon ? 15000 : 0)
              )
            )}
          </span>
        </div>
      </div>

      {/* Primary CTA Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={isSubmitting || summary.subtotal === 0}
        className="w-full bg-orange-600 hover:bg-orange-500 active:scale-[0.99] disabled:bg-slate-300 disabled:shadow-none text-white font-extrabold text-sm sm:text-base py-3.5 rounded-xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Đang xử lý...
          </span>
        ) : (
          <>
            <span>Thanh Toán Ngay ⚡</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
};
