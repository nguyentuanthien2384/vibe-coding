"use client";

import React from "react";
import Link from "next/link";
import { PointsHistoryTableProps, PointsTransactionType } from "../../../types/points.types";

const typeStyles: Record<
  PointsTransactionType,
  { label: string; badge: string; pointsClass: string; prefix: string; icon: string }
> = {
  EARN: {
    label: "Tích điểm",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pointsClass: "text-emerald-600 font-extrabold",
    prefix: "+",
    icon: "🎁",
  },
  REDEEM: {
    label: "Dùng điểm",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    pointsClass: "text-red-600 font-extrabold",
    prefix: "-",
    icon: "🛒",
  },
  REFUND: {
    label: "Hoàn điểm",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    pointsClass: "text-amber-600 font-extrabold",
    prefix: "+",
    icon: "↺",
  },
  EXPIRE: {
    label: "Hết hạn",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    pointsClass: "text-slate-500 font-medium",
    prefix: "-",
    icon: "⏳",
  },
  ADJUST: {
    label: "Điều chỉnh",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    pointsClass: "text-blue-600 font-extrabold",
    prefix: "",
    icon: "⚙️",
  },
};

export const PointsHistoryTable: React.FC<PointsHistoryTableProps> = ({
  items,
  isLoading = false,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(Math.abs(val));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 animate-pulse flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
        <div className="text-4xl mb-3">🪙</div>
        <h4 className="text-base font-bold text-slate-800">
          Chưa có biến động điểm nào
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          Hãy đặt mua những món ăn thơm ngon trên TechBite để bắt đầu tích lũy
          điểm thưởng ngay hôm nay!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-orange-600/20"
        >
          <span>Khám phá thực đơn</span>
          <span>➔</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const style = typeStyles[item.type] || typeStyles.EARN;
        const isPositive = item.points > 0 || item.type === "EARN" || item.type === "REFUND";

        return (
          <div
            key={item.id}
            className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all hover:shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            {/* Left Info */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shrink-0">
                {style.icon}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${style.badge}`}
                  >
                    {style.label}
                  </span>

                  {item.orderCode && (
                    <Link
                      href={`/orders/${item.orderCode}`}
                      className="text-xs font-semibold text-orange-600 hover:underline hover:text-orange-700 truncate"
                    >
                      Đơn #{item.orderCode}
                    </Link>
                  )}
                </div>

                <p className="text-xs font-medium text-slate-700 break-words">
                  {item.description}
                </p>

                <div className="text-[11px] text-slate-400">
                  {formatDate(item.createdAt)}
                </div>
              </div>
            </div>

            {/* Right Points Amount */}
            <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-50">
              <div
                className={`text-base sm:text-lg ${
                  isPositive
                    ? "text-emerald-600 font-extrabold"
                    : "text-red-600 font-extrabold"
                }`}
              >
                {isPositive ? "+" : "-"}
                {formatNumber(item.points)}{" "}
                <span className="text-xs font-semibold text-slate-500">
                  điểm
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                Số dư: <strong className="text-slate-600">{formatNumber(item.balanceAfter)}</strong> điểm
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
