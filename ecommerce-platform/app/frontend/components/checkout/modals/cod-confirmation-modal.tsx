"use client";

import React from "react";
import { Backdrop } from "../../ui/backdrop";
import { CODConfirmationModalProps } from "../../../types/checkout";

export const CODConfirmationModal: React.FC<CODConfirmationModalProps> = ({
  isOpen,
  orderCode,
  totalAmount,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Backdrop isOpen={isOpen} onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl z-10 border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          🚚
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-2">
          Xác Nhận Đặt Hàng COD
        </h3>

        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Đơn hàng <strong className="text-slate-900">{orderCode}</strong> của quý khách đã được tạo thành công!
        </p>

        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 font-medium">Mã đơn hàng:</span>
            <span className="font-bold text-slate-900">{orderCode}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 font-medium">Số tiền COD:</span>
            <span className="font-extrabold text-red-600 text-base">
              {formatPrice(totalAmount)}
            </span>
          </div>
          <div className="pt-2 border-t border-orange-100 text-xs text-slate-500 italic">
            💡 Ghi chú: Quý khách vui lòng chuẩn bị đúng số tiền và thanh toán trực tiếp cho shipper khi nhận hàng.
          </div>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md shadow-orange-600/20 transition-all text-base cursor-pointer"
        >
          Hoàn tất & Xem đơn hàng
        </button>
      </div>
    </div>
  );
};
