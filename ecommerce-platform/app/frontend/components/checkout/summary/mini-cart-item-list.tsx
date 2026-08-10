"use client";

import React from "react";
import { MiniCartItemListProps } from "../../../types/checkout";
import { MiniCartItem } from "./mini-cart-item";

export const MiniCartItemList: React.FC<MiniCartItemListProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-slate-400 font-medium text-sm">
        Chưa có sản phẩm nào trong giỏ hàng.
      </div>
    );
  }

  return (
    <div className="max-h-[280px] overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
      {items.map((item) => (
        <MiniCartItem key={item.id} item={item} />
      ))}
    </div>
  );
};
