"use client";

import React from "react";

interface CheckoutLayoutGridProps {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}

export const CheckoutLayoutGrid: React.FC<CheckoutLayoutGridProps> = ({
  leftColumn,
  rightColumn,
}) => {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Customer & Shipping (7/12) */}
        <div className="w-full lg:w-7/12 space-y-6">{leftColumn}</div>

        {/* Right Column: Order Summary (5/12, Sticky) */}
        <div className="w-full lg:w-5/12 lg:sticky lg:top-24 space-y-6">
          {rightColumn}
        </div>
      </div>
    </div>
  );
};
