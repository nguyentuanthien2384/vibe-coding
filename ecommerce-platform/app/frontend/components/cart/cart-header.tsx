"use client";

import React from "react";
import { CartHeaderProps } from "../../types/cart";

export const CartHeader: React.FC<CartHeaderProps> = ({
  totalCount,
  onClose,
  onClearCart,
}) => {
  return (
    <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center text-white text-base shadow-sm shadow-orange-600/30">
          🛍️
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Giỏ Hàng Của Bạn
            </h2>
            <span className="bg-orange-100 text-orange-700 text-xs font-extrabold px-2 py-0.5 rounded-full">
              {totalCount} món
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            TechBite — Giao hàng siêu tốc trong 30 phút ⚡
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {totalCount > 0 && onClearCart && (
          <button
            onClick={onClearCart}
            className="text-xs font-semibold text-slate-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            title="Xóa tất cả sản phẩm"
          >
            Xóa sạch
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Đóng giỏ hàng"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
