"use client";

import React from "react";
import { PointsBalanceHeroCardProps } from "../../../types/points.types";
import { PointsTierBadge } from "./points-tier-badge";

export const PointsBalanceHeroCard: React.FC<PointsBalanceHeroCardProps> = ({
  summary,
  onViewGuide,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";
  const formatNumber = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val);

  const { tierProgress } = summary;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6 text-white shadow-lg shadow-orange-500/15 border border-amber-400/30">
      {/* Background Decorative Rings */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-orange-700/20 blur-lg pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐️</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100/90 block">
                Điểm Thưởng TechBite
              </span>
              <h3 className="text-sm font-semibold text-white/95">
                Ví điểm thành viên
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PointsTierBadge tier={summary.membershipTier} />
            {onViewGuide && (
              <button
                type="button"
                onClick={onViewGuide}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors backdrop-blur-xs cursor-pointer border border-white/20"
              >
                <span>📖</span>
                <span>Thể lệ</span>
              </button>
            )}
          </div>
        </div>

        {/* Big Balance Display */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-y border-white/20 py-4">
          <div>
            <div className="text-xs text-amber-100 font-medium mb-1">
              Số dư khả dụng
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-xs font-headline">
                {formatNumber(summary.currentPoints)}
              </span>
              <span className="text-base sm:text-lg font-extrabold text-amber-100">
                điểm
              </span>
            </div>
          </div>

          <div className="sm:text-right bg-white/15 px-3.5 py-2 rounded-xl backdrop-blur-xs border border-white/15 inline-block sm:self-center">
            <div className="text-[11px] text-amber-100/90">
              Quy đổi giá trị mua sắm
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white">
              ≈ {formatCurrency(summary.equivalentVnd)}
            </div>
          </div>
        </div>

        {/* Tier Progress Bar */}
        {tierProgress.nextTier && (
          <div className="space-y-2 bg-black/10 p-3.5 rounded-xl border border-white/10">
            <div className="flex justify-between items-center text-xs font-medium text-amber-100">
              <span>
                Tiến trình lên hạng{" "}
                <strong className="text-white font-bold">
                  {tierProgress.nextTier}
                </strong>
              </span>
              <span>{Math.round(tierProgress.progressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-white h-full rounded-full transition-all duration-500 shadow-xs"
                style={{
                  width: `${Math.min(100, Math.max(0, tierProgress.progressPercentage))}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-amber-200/80">
              <span>Đã tích lũy: {formatCurrency(tierProgress.currentTierSpent)}</span>
              <span>
                Cần thêm:{" "}
                {formatCurrency(
                  Math.max(
                    0,
                    tierProgress.nextTierThreshold - tierProgress.currentTierSpent
                  )
                )}
              </span>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] text-amber-100/90">Tổng điểm đã tích</div>
            <div className="text-sm font-bold text-white mt-0.5">
              +{formatNumber(summary.totalPointsEarned)}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] text-amber-100/90">Tổng điểm đã tiêu</div>
            <div className="text-sm font-bold text-white mt-0.5">
              -{formatNumber(summary.totalPointsRedeemed)}
            </div>
          </div>

          {summary.pointsExpiringSoon ? (
            <div className="col-span-2 sm:col-span-1 bg-red-500/20 rounded-xl p-2.5 backdrop-blur-xs border border-red-300/30">
              <div className="text-[11px] text-red-100">Điểm sắp hết hạn</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {formatNumber(summary.pointsExpiringSoon.points)} điểm
              </div>
            </div>
          ) : (
            <div className="col-span-2 sm:col-span-1 bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
              <div className="text-[11px] text-amber-100/90">Thời hạn sử dụng</div>
              <div className="text-sm font-bold text-white mt-0.5">Vĩnh viễn</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
