"use client";

import React from "react";
import { BackdropProps } from "../../types/cart";

export const Backdrop: React.FC<BackdropProps> = ({
  isOpen,
  onClick,
  className = "",
}) => {
  return (
    <div
      onClick={onClick}
      className={`fixed inset-0 z-40 bg-slate-900/60 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } ${className}`}
      aria-hidden="true"
    />
  );
};
