"use client";

import React, { useState, useEffect } from "react";
import { PointsRedemptionCardProps } from "../../../types/points.types";

export const PointsRedemptionCard: React.FC<PointsRedemptionCardProps> = ({
  availablePoints,
  maxPointsCanUse,
  pointsToUse,
  conversionRate,
  discountAmount,
  isUsingPoints,
  onToggleUsePoints,
  onPointsChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    pointsToUse > 0 ? pointsToUse.toString() : ""
  );

  // Sync internal input value with props
  useEffect(() => {
    setInputValue(pointsToUse > 0 ? pointsToUse.toString() : "");
  }, [pointsToUse]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onToggleUsePoints(checked);
    if (checked) {
      // Mặc định chọn dùng tối đa khi vừa bật
      onPointsChange(maxPointsCanUse);
    } else {
      onPointsChange(0);
    }
  };

  const handleQuickSelect = (percentage: number) => {
    const calculated = Math.min(
      maxPointsCanUse,
      Math.floor(maxPointsCanUse * (percentage / 100))
    );
    onPointsChange(calculated);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    setInputValue(rawVal);

    if (rawVal === "") {
      onPointsChange(0);
      return;
    }

    const num = parseInt(rawVal, 10);
    if (isNaN(num)) {
      onPointsChange(0);
    } else {
      const clamped = Math.min(maxPointsCanUse, Math.max(0, num));
      onPointsChange(clamped);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 p-4 sm:p-5 space-y-4 shadow-2xs">
      {/* Header Toggle */}
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isUsingPoints}
            onChange={handleToggle}
            disabled={disabled || availablePoints <= 0}
            className="mt-0.5 w-4 h-4 text-orange-600 rounded-sm border-gray-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-slate-900">
                Dùng điểm thưởng TechBite
              </span>
              <span className="text-xs">⭐️</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bạn có{" "}
              <strong className="text-amber-700 font-bold">
                {availablePoints} điểm
              </strong>{" "}
              (≈ {formatCurrency(availablePoints * conversionRate)})
            </p>
          </div>
        </label>

        {isUsingPoints && discountAmount > 0 && (
          <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full shrink-0">
            -{formatCurrency(discountAmount)}
          </span>
        )}
      </div>

      {/* Expanded Controls when Toggle is Active */}
      {isUsingPoints && availablePoints > 0 && (
        <div className="space-y-3 pt-3 border-t border-amber-100 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Điểm áp dụng cho đơn này:</span>
            <span className="font-semibold text-slate-800">
              Tối đa: {maxPointsCanUse} điểm
            </span>
          </div>

          {/* Quick Select Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect(25)}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                pointsToUse === Math.floor(maxPointsCanUse * 0.25) && pointsToUse > 0
                  ? "bg-orange-50 text-orange-700 border-orange-300 shadow-2xs"
                  : "bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              25% ({Math.floor(maxPointsCanUse * 0.25)})
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect(50)}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                pointsToUse === Math.floor(maxPointsCanUse * 0.5) && pointsToUse > 0
                  ? "bg-orange-50 text-orange-700 border-orange-300 shadow-2xs"
                  : "bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              50% ({Math.floor(maxPointsCanUse * 0.5)})
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect(100)}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                pointsToUse === maxPointsCanUse && maxPointsCanUse > 0
                  ? "bg-orange-600 text-white border-orange-600 shadow-2xs"
                  : "bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Dùng hết ({maxPointsCanUse})
            </button>
          </div>

          {/* Custom Points Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Nhập số điểm tùy chọn..."
                className="w-full pl-3 pr-14 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900 bg-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">
                điểm
              </span>
            </div>

            <button
              type="button"
              onClick={() => onPointsChange(maxPointsCanUse)}
              className="text-xs text-orange-600 font-bold hover:underline px-2 py-1"
            >
              Tối đa
            </button>
          </div>

          {/* Rate note */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Tỷ lệ quy đổi: 1 điểm = {formatCurrency(conversionRate)}</span>
            <span>Khấu trừ: {formatCurrency(pointsToUse * conversionRate)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
