"use client";

import React, { useState } from "react";
import { useDebounce } from "../../../hooks/use-debounce";
import { AppliedVoucherData } from "../../../types/checkout";
import { applyVoucherApi } from "../../../lib/checkout";

interface CouponInputContainerProps {
  subtotal: number;
  onApplyVoucher: (voucher: AppliedVoucherData | null) => void;
  appliedVoucher: AppliedVoucherData | null;
}

export const CouponInputContainer: React.FC<CouponInputContainerProps> = ({
  subtotal,
  onApplyVoucher,
  appliedVoucher,
}) => {
  const [inputCode, setInputCode] = useState("TECHBITE200K");
  const [isApplying, setIsApplying] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const debouncedCode = useDebounce(inputCode, 400);

  const handleApply = async () => {
    const code = debouncedCode.trim().toUpperCase();
    if (!code) {
      setFeedbackMsg({
        type: "error",
        text: "Vui lòng nhập mã giảm giá",
      });
      return;
    }

    setIsApplying(true);
    setFeedbackMsg(null);

    try {
      const voucherData = await applyVoucherApi(code, subtotal);
      onApplyVoucher(voucherData);
      setFeedbackMsg({
        type: "success",
        text: `Đã áp dụng mã ${voucherData.voucherCode} thành công!`,
      });
    } catch (err: any) {
      onApplyVoucher(null);
      setFeedbackMsg({
        type: "error",
        text: err.message || "Mã giảm giá không tồn tại hoặc đã hết hạn",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveVoucher = () => {
    setInputCode("");
    onApplyVoucher(null);
    setFeedbackMsg(null);
  };

  return (
    <div className="border-y border-gray-100 py-4 my-4 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          placeholder="MÃ GIẢM GIÁ"
          className="flex-grow rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm uppercase font-bold text-slate-900 shadow-sm focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all placeholder:normal-case placeholder:font-normal"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isApplying}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 rounded-xl text-sm font-bold transition-all shrink-0 active:scale-95 flex items-center justify-center min-w-[90px]"
        >
          {isApplying ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Áp dụng"
          )}
        </button>
      </div>

      {appliedVoucher && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span>🎟️</span>
            <span>
              Voucher: <strong>{appliedVoucher.voucherCode}</strong> (
              -{new Intl.NumberFormat("vi-VN").format(appliedVoucher.calculatedDiscount)}đ)
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemoveVoucher}
            className="text-slate-400 hover:text-red-600 transition-colors font-extrabold text-sm ml-2"
            title="Xóa voucher"
          >
            ×
          </button>
        </div>
      )}

      {feedbackMsg && !appliedVoucher && (
        <p
          className={`text-xs font-medium ${
            feedbackMsg.type === "success" ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {feedbackMsg.text}
        </p>
      )}
    </div>
  );
};
