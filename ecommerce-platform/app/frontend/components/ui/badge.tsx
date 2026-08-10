"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  className = "",
}) => {
  const variantStyles = {
    primary: "bg-orange-600 text-white",
    secondary: "bg-slate-900 text-white",
    success: "bg-green-600 text-white",
    danger: "bg-red-600 text-white",
    warning: "bg-amber-500 text-white",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold tracking-wide shadow-xs ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
