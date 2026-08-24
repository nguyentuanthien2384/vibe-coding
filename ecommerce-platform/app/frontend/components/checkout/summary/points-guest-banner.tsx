"use client";

import React from "react";
import Link from "next/link";
import { PointsGuestBannerProps } from "../../../types/points.types";

export const PointsGuestBanner: React.FC<PointsGuestBannerProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-2xs ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">🎁</span>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-amber-950">
            Đăng nhập để tích & trừ điểm
          </h4>
          <p className="text-[11px] sm:text-xs text-amber-900/80 mt-0.5">
            Thành viên TechBite được tích lũy 1% giá trị đơn hàng và đổi điểm giảm
            giá trực tiếp!
          </p>
        </div>
      </div>

      <Link
        href="/login?redirect=/checkout"
        className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs inline-block self-end sm:self-center"
      >
        Đăng nhập ngay
      </Link>
    </div>
  );
};
