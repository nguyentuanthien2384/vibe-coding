"use client";

import React from "react";
import Image from "next/image";
import { MiniCartItemData } from "../../../types/checkout";
import { getImageUrl } from "../../../lib/image-url";

interface MiniCartItemProps {
  item: MiniCartItemData;
}

export const MiniCartItem: React.FC<MiniCartItemProps> = ({ item }) => {
  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

  return (
    <div className="flex gap-3.5 items-center py-3 border-b border-gray-100 last:border-0">
      <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 relative overflow-hidden border border-gray-100">
        {item.image ? (
          <Image
            src={getImageUrl(item.image)}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs bg-slate-100">
            TechBite
          </div>
        )}
      </div>

      <div className="flex-grow min-w-0">
        <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">
          {item.name}
        </h4>
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            SL: {item.quantity}
          </span>
          <div className="text-right">
            <span className="font-bold text-slate-900 text-sm block">
              {formatPrice(item.price * item.quantity)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-[11px] text-slate-400 line-through block">
                {formatPrice(item.originalPrice * item.quantity)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
