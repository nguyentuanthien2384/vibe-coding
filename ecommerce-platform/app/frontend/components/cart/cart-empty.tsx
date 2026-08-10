"use client";

import React from "react";

interface CartEmptyProps {
  onContinueShopping: () => void;
}

export const CartEmpty: React.FC<CartEmptyProps> = ({ onContinueShopping }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[360px] animate-fadeIn">
      {/* Icon Illustration */}
      <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-5 text-4xl shadow-inner shadow-orange-100/50">
        🛒
      </div>

      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">
        Giỏ hàng của bạn đang trống!
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">
        Chưa có món ăn vặt hay đồ uống nào được chọn. Hãy tiếp tục khám phá các combo chạy deadline hot nhất!
      </p>

      <button
        onClick={onContinueShopping}
        className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-2"
      >
        <span>⚡ Xem Thực Đơn Hot</span>
      </button>
    </div>
  );
};
