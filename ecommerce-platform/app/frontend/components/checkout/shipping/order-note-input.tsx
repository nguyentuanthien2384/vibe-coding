"use client";

import React from "react";

interface OrderNoteInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const OrderNoteInput: React.FC<OrderNoteInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        Ghi chú đơn hàng (Tùy chọn)
      </label>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ví dụ: Giao giờ hành chính, gọi điện trước khi giao..."
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
      />
    </div>
  );
};
