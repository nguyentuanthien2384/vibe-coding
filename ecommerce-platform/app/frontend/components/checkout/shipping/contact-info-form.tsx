"use client";

import React from "react";
import { ContactInfoFormProps } from "../../../types/checkout";

export const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  fullName,
  email,
  phone,
  onChange,
  errors = {},
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn A"
            className={`w-full rounded-xl border ${
              errors.fullName ? "border-red-500 bg-red-50/20" : "border-gray-300 bg-gray-50"
            } px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all`}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Ví dụ: 0987654321"
            className={`w-full rounded-xl border ${
              errors.phone ? "border-red-500 bg-red-50/20" : "border-gray-300 bg-gray-50"
            } px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Địa chỉ Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="nguyenvana@gmail.com"
          className={`w-full rounded-xl border ${
            errors.email ? "border-red-500 bg-red-50/20" : "border-gray-300 bg-gray-50"
          } px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all`}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
        )}
      </div>
    </div>
  );
};
