"use client";

import React from "react";
import Link from "next/link";

export const CheckoutFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white w-full mt-auto border-t border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-8 py-10 max-w-[1280px] mx-auto w-full gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-white">
            ⚡ TechBite
          </span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
            Checkout Mode
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
          <Link
            href="#"
            className="hover:text-orange-500 transition-colors opacity-90 hover:opacity-100"
          >
            Chính sách bảo mật
          </Link>
          <Link
            href="#"
            className="hover:text-orange-500 transition-colors opacity-90 hover:opacity-100"
          >
            Điều khoản dịch vụ
          </Link>
          <Link
            href="#"
            className="hover:text-orange-500 transition-colors opacity-90 hover:opacity-100"
          >
            Trung tâm hỗ trợ
          </Link>
        </div>

        <div className="text-sm font-medium text-slate-400">
          © {new Date().getFullYear()} TechBite. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
