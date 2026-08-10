"use client";

import React from "react";

interface CheckoutTermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export const CheckoutTermsCheckbox: React.FC<CheckoutTermsCheckboxProps> = ({
  checked,
  onChange,
  error,
}) => {
  return (
    <div>
      <label className="flex items-start gap-2.5 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mt-0.5 h-4 w-4 transition-colors"
        />
        <span className="text-xs md:text-sm text-slate-600 leading-snug group-hover:text-slate-900 transition-colors">
          Tôi đã đọc và đồng ý với{" "}
          <a
            href="#"
            onClick={(e) => e.stopPropagation()}
            className="text-orange-600 font-semibold hover:underline"
          >
            Điều khoản dịch vụ
          </a>{" "}
          và{" "}
          <a
            href="#"
            onClick={(e) => e.stopPropagation()}
            className="text-orange-600 font-semibold hover:underline"
          >
            Chính sách bảo mật
          </a>{" "}
          của TechBite.
        </span>
      </label>
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium pl-6">{error}</p>
      )}
    </div>
  );
};
