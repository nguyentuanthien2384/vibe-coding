"use client";

import React from "react";
import { MembershipTier, PointsTierBadgeProps } from "../../../types/points.types";

const tierConfig: Record<
  MembershipTier,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  BRONZE: {
    label: "Hạng Đồng",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: "🥉",
  },
  SILVER: {
    label: "Hạng Bạc",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: "🥈",
  },
  GOLD: {
    label: "Hạng Vàng",
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
    icon: "🥇",
  },
  DIAMOND: {
    label: "Hạng Kim Cương",
    bg: "bg-cyan-50",
    text: "text-cyan-800",
    border: "border-cyan-300",
    icon: "💎",
  },
};

export const PointsTierBadge: React.FC<PointsTierBadgeProps> = ({
  tier,
  showIcon = true,
  className = "",
}) => {
  const config = tierConfig[tier] || tierConfig.BRONZE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border shadow-2xs tracking-wide ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};
