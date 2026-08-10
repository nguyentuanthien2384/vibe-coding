"use client";

import React from "react";

interface CheckoutSubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const CheckoutSubmitButton: React.FC<CheckoutSubmitButtonProps> = ({
  onClick,
  isLoading,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading || disabled}
      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-extrabold rounded-xl py-4 w-full shadow-lg shadow-orange-600/25 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-base md:text-lg cursor-pointer"
    >
      {isLoading ? (
        <>
          <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>Đang xử lý đơn hàng...</span>
        </>
      ) : (
        <>
          <span>⚡</span>
          <span>Xác nhận & Thanh toán</span>
        </>
      )}
    </button>
  );
};
