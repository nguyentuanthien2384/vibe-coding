"use client";

import React from "react";
import Image from "next/image";
import { CartItemProps } from "../../types/cart";
import { QuantityCounter } from "../ui/quantity-counter";
import { getImageUrl } from "../../lib/image-url";

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
  isUpdating = false,
}) => {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  const subtotal = item.price * item.quantity;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-slate-200 transition-all flex gap-3 sm:gap-4 items-center group relative ${
        isUpdating ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Thumbnail (1:1 aspect ratio) */}
      <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
        <Image
          src={getImageUrl(item.image)}
          alt={item.name}
          fill
          sizes="88px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
              {item.name}
            </h3>
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemoveItem(item.id)}
              className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
              title="Xóa khỏi giỏ"
              aria-label={`Xóa ${item.name}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          {/* Unit Price */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-red-600">
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-[11px] font-normal text-slate-400 line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Quantity Counter & Line Subtotal */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-50">
          <QuantityCounter
            quantity={item.quantity}
            maxStock={item.stock}
            onChange={(newQty) => onUpdateQuantity(item.id, newQty)}
            disabled={isUpdating}
            size="sm"
          />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Thành tiền</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
