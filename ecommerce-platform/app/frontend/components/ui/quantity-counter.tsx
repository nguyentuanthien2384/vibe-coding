"use client";

import React from "react";
import { QuantityCounterProps } from "../../types/cart";

export const QuantityCounter: React.FC<QuantityCounterProps> = ({
  quantity,
  maxStock,
  minQuantity = 1,
  onChange,
  disabled = false,
  size = "md",
}) => {
  const isMin = quantity <= minQuantity;
  const isMax = quantity >= maxStock;

  const buttonPadding = size === "sm" ? "w-6 h-6 text-xs" : "w-7 h-7 text-sm";
  const textContainer = size === "sm" ? "px-2 text-xs font-semibold" : "px-3 text-sm font-bold";

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 shadow-inner">
      <button
        type="button"
        onClick={() => !isMin && !disabled && onChange(quantity - 1)}
        disabled={isMin || disabled}
        className={`${buttonPadding} flex items-center justify-center rounded-md text-slate-700 hover:bg-white hover:shadow-xs disabled:opacity-30 disabled:hover:bg-transparent transition-all select-none`}
        aria-label="Giảm số lượng"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>

      <span className={`${textContainer} text-slate-900 min-w-[28px] text-center select-none`}>
        {quantity}
      </span>

      <button
        type="button"
        onClick={() => !isMax && !disabled && onChange(quantity + 1)}
        disabled={isMax || disabled}
        className={`${buttonPadding} flex items-center justify-center rounded-md text-slate-700 hover:bg-white hover:shadow-xs disabled:opacity-30 disabled:hover:bg-transparent transition-all select-none`}
        aria-label="Tăng số lượng"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};
