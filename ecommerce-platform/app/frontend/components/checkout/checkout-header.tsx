"use client";

import React from "react";
import Link from "next/link";

interface CheckoutHeaderProps {
  currentStep?: number;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  currentStep = 2,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 w-full z-50 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center px-4 md:px-6 py-4 max-w-[1280px] mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
            ⚡ TechBite
          </span>
        </Link>

        {/* Transactional Stepper */}
        <nav className="flex items-center space-x-2 md:space-x-3 text-xs md:text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors ${
              currentStep === 1
                ? "text-orange-600 font-bold border-b-2 border-orange-600 pb-0.5"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            1. Giỏ hàng
          </Link>
          <svg
            className="w-4 h-4 text-slate-300 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>

          <span
            className={`${
              currentStep === 2
                ? "text-orange-600 font-bold border-b-2 border-orange-600 pb-0.5"
                : "text-slate-400"
            }`}
          >
            2. Thanh toán
          </span>
          <svg
            className="w-4 h-4 text-slate-300 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>

          <span
            className={`${
              currentStep === 3
                ? "text-orange-600 font-bold border-b-2 border-orange-600 pb-0.5"
                : "text-slate-400"
            }`}
          >
            3. Hoàn tất
          </span>
        </nav>

        {/* Secured Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <svg
            className="w-4 h-4 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="font-semibold text-slate-700">Thanh toán bảo mật 256-bit</span>
        </div>
      </div>
    </header>
  );
};
