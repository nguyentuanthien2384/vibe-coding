"use client";

import React from "react";
import Link from "next/link";
import { GeneralSettings } from "../../types/settings";

interface CheckoutFooterProps {
  generalSettings?: GeneralSettings;
}

export const CheckoutFooter: React.FC<CheckoutFooterProps> = ({ generalSettings }) => {
  const storeName = generalSettings?.storeName || 'TechBite';
  const copyrightText = generalSettings?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  return (
    <footer className="bg-slate-900 text-white w-full mt-auto border-t border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-8 py-10 max-w-[1280px] mx-auto w-full gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-white">
            ⚡ {storeName}
          </span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
            Secure Checkout Mode
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
          <Link
            href="/policy/shipping"
            className="hover:text-orange-500 transition-colors opacity-90 hover:opacity-100"
          >
            Chính sách giao hàng
          </Link>
          <Link
            href="/policy/return"
            className="hover:text-orange-500 transition-colors opacity-90 hover:opacity-100"
          >
            Đổi trả &amp; Hoàn tiền
          </Link>
          <Link
            href="/faq"
            className="hover:text-orange-500 transition-colors opacity-90 hover:opacity-100"
          >
            Trung tâm hỗ trợ
          </Link>
        </div>

        <div className="text-xs font-medium text-slate-500 text-center sm:text-right">
          {copyrightText}
        </div>
      </div>
    </footer>
  );
};
