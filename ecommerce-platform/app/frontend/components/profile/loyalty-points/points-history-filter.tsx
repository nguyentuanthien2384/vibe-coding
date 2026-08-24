"use client";

import React from "react";
import { PointsHistoryFilterProps, PointsTransactionType } from "../../../types/points.types";

const filters: Array<{ label: string; value: PointsTransactionType | "ALL"; icon: string }> = [
  { label: "Tất cả giao dịch", value: "ALL", icon: "📑" },
  { label: "Tích điểm (+)", value: "EARN", icon: "➕" },
  { label: "Dùng điểm (-)", value: "REDEEM", icon: "➖" },
  { label: "Hoàn điểm (↺)", value: "REFUND", icon: "↺" },
];

export const PointsHistoryFilter: React.FC<PointsHistoryFilterProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {filters.map((f) => {
        const isActive = currentFilter === f.value;
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilterChange(f.value)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-orange-600 text-white shadow-sm shadow-orange-600/20"
                : "bg-gray-100/80 hover:bg-gray-200/80 text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
};
