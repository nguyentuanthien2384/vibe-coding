"use client";

import React from "react";
import { PointsRuleGuideCardProps } from "../../../types/points.types";

export const PointsRuleGuideCard: React.FC<PointsRuleGuideCardProps> = ({
  config,
  className = "",
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

  return (
    <div
      className={`bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3.5">
        <span className="text-xl">💡</span>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 font-headline">
            Chính Sách & Quy Định Tích Điểm
          </h3>
          <p className="text-xs text-slate-500">
            Tận dụng điểm thưởng để tiết kiệm tối đa chi phí mua sắm
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Rule 1: Tích điểm */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <span className="p-1 rounded-lg bg-amber-200/80 text-xs">01</span>
            <span>Tích điểm tự động</span>
          </div>
          <p className="text-xs text-amber-900/80 leading-relaxed">
            Nhận ngay{" "}
            <strong>{config.earnRatePercentage}% giá trị đơn hàng</strong> thành
            điểm thưởng sau khi đơn hàng được giao thành công.
          </p>
          <div className="text-[11px] text-amber-800 font-medium bg-white/70 px-2.5 py-1.5 rounded-lg border border-amber-200">
            Ví dụ: Đơn 500.000đ ➔ Nhận +50 điểm
          </div>
        </div>

        {/* Rule 2: Đổi điểm */}
        <div className="bg-orange-50/70 border border-orange-200/70 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-orange-900 font-bold text-sm">
            <span className="p-1 rounded-lg bg-orange-200/80 text-xs">02</span>
            <span>Quy đổi linh hoạt</span>
          </div>
          <p className="text-xs text-orange-900/80 leading-relaxed">
            Mỗi <strong>1 điểm = {formatCurrency(config.redeemRateVnd)}</strong>.
            Có thể trừ trực tiếp vào giá trị đơn hàng tại bước thanh toán.
          </p>
          <div className="text-[11px] text-orange-800 font-medium bg-white/70 px-2.5 py-1.5 rounded-lg border border-orange-200">
            Trừ tối đa đến {config.maxRedeemPercentage}% đơn (0đ)
          </div>
        </div>

        {/* Rule 3: Điều kiện & Hạn mức */}
        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <span className="p-1 rounded-lg bg-emerald-200/80 text-xs">03</span>
            <span>An tâm & Minh bạch</span>
          </div>
          <p className="text-xs text-emerald-900/80 leading-relaxed">
            Được hoàn lại 100% điểm nếu đơn hàng bị hủy. Điểm có hiệu lực{" "}
            <strong>
              {config.pointsExpiryDays > 0
                ? `${config.pointsExpiryDays} ngày`
                : "Vĩnh viễn"}
            </strong>
            .
          </p>
          <div className="text-[11px] text-emerald-800 font-medium bg-white/70 px-2.5 py-1.5 rounded-lg border border-emerald-200">
            Tối thiểu {config.minPointsToRedeem} điểm / lần đổi
          </div>
        </div>
      </div>
    </div>
  );
};
