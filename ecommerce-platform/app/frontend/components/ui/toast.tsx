"use client";

import React, { useEffect } from "react";
import { useCartStore } from "../../store/use-cart-store";

export const Toast: React.FC = () => {
  const { toastMessage, clearToast, openCart } = useCartStore();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 animate-bounce-short">
      <div className="bg-slate-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-slate-800 flex items-center gap-3 max-w-sm sm:max-w-md">
        <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {toastMessage}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            Nạp thêm đồ ăn vặt hoặc bấm để xem giỏ
          </p>
        </div>

        <button
          onClick={() => {
            clearToast();
            openCart();
          }}
          className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 shadow-sm"
        >
          Xem giỏ 🛒
        </button>

        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Đóng thông báo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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

export const showToast = ({ message }: { message: string; type?: 'success' | 'error' | 'info' }) => {
  useCartStore.getState().setToastMessage(message);
};
