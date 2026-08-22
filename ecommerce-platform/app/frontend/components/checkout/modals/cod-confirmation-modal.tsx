"use client";

import React from "react";
import { Backdrop } from "../../ui/backdrop";
import { CODConfirmationModalProps } from "../../../types/checkout";

const TruckIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z" />
    <circle cx="17" cy="18.5" r="2.5" />
    <circle cx="7" cy="18.5" r="2.5" />
  </svg>
);

export const CODConfirmationModal: React.FC<CODConfirmationModalProps> = ({
  isOpen,
  orderCode,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Backdrop isOpen={isOpen} onClick={onClose} />
      <div className="relative bg-white rounded-[28px] max-w-sm sm:max-w-md w-full p-6 sm:p-8 shadow-2xl z-10 border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
        {/* Red Circular Icon with Delivery Truck */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 bg-[#D92D4B] text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/20">
          <TruckIcon className="w-8 h-8 sm:w-9 sm:h-9" />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
          Đặt hàng thành công! 🎉
        </h3>

        {/* Subtitle */}
        <p className="text-slate-500 text-sm font-medium mb-1">
          Mã đơn hàng của bạn:
        </p>

        {/* Order Code in Orange */}
        <div className="text-2xl sm:text-[26px] font-black text-[#FF6B00] tracking-wide mb-6">
          {orderCode}
        </div>

        {/* Info Box */}
        <div className="bg-[#F1F4F9] rounded-2xl p-4 sm:p-5 mb-6 text-xs sm:text-sm text-slate-600 text-center leading-relaxed">
          <p className="flex items-start justify-center gap-1.5 text-center">
            <span className="text-[#4880FF] font-bold text-sm shrink-0">ⓘ</span>
            <span>
              Thanh toán <strong className="text-slate-800">trực tiếp</strong>{" "}
              <span className="bg-pink-100 text-pink-700 px-1 py-0.5 rounded font-semibold">
                cho shipper
              </span>{" "}
              khi nhận hàng. Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.
            </span>
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onConfirm}
          className="w-full bg-[#C84B0E] hover:bg-[#B33E07] active:scale-[0.99] text-white font-extrabold py-3.5 sm:py-4 px-6 rounded-2xl shadow-lg shadow-orange-600/25 transition-all text-base cursor-pointer"
        >
          Xem chi tiết đơn hàng
        </button>
      </div>
    </div>
  );
};
