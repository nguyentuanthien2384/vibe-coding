"use client";

import React from "react";
import { CartItemListProps } from "../../types/cart";
import { CartItem } from "./cart-item";
import { CartEmpty } from "./cart-empty";

export const CartItemList: React.FC<CartItemListProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onContinueShopping,
  isLoading,
  error,
}) => {
  // 1. [Trạng thái Loading]: Hiển thị Skeleton pulse khi đang tải từ API
  if (isLoading && items.length === 0) {
    return (
      <div className="flex-1 p-4 sm:p-6 space-y-3 custom-scrollbar animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-100/70 rounded-xl">
            <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. [Trạng thái Error]: Hiển thị cảnh báo lỗi nếu API gặp sự cố
  if (error && items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-800 mb-1">Không thể tải dữ liệu giỏ hàng</p>
        <p className="text-xs text-slate-500 mb-4">{error}</p>
        <button
          onClick={onContinueShopping}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  // 3. [Trạng thái Empty State]: Giỏ hàng trống
  if (items.length === 0) {
    return <CartEmpty onContinueShopping={onContinueShopping} />;
  }

  // 4. [Trạng thái Success State]: Danh sách sản phẩm trong giỏ
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={(id, qty) => onUpdateQuantity(String(id), qty)}
          onRemoveItem={(id) => onRemoveItem(String(id))}
        />
      ))}
    </div>
  );
};
