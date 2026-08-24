"use client";

import React from "react";
import { PointsEarningPreviewProps } from "../../../types/points.types";

export const PointsEarningPreview: React.FC<PointsEarningPreviewProps> = ({
  estimatedPoints,
  conversionRate = 1000,
  className = "",
}) => {
  if (estimatedPoints <= 0) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

  return (
    <div
      className={`bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">✨</span>
        <span>
          Tích lũy dự kiến:{" "}
          <strong className="text-emerald-700 font-extrabold text-sm">
            +{estimatedPoints} điểm
          </strong>
        </span>
      </div>

      <span className="text-[11px] text-emerald-700/80 font-medium">
        (≈ {formatCurrency(estimatedPoints * conversionRate)})
      </span>
    </div>
  );
};
