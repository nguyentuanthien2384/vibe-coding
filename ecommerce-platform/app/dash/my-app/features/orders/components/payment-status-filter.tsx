'use client';

import React from 'react';
import { PaymentStatus } from '../types/order.types';
import { CreditCard } from 'lucide-react';

export interface PaymentStatusFilterProps {
  value: PaymentStatus | 'ALL';
  onChange: (value: PaymentStatus | 'ALL') => void;
}

export const PaymentStatusFilter: React.FC<PaymentStatusFilterProps> = ({ value, onChange }) => {
  return (
    <div className="relative flex items-center">
      <CreditCard className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PaymentStatus | 'ALL')}
        className="pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 focus:border-[#4880FF] transition-all cursor-pointer shadow-sm"
      >
        <option value="ALL">Tất cả thanh toán</option>
        <option value="UNPAID">Chưa thanh toán</option>
        <option value="PAID">Đã thanh toán</option>
        <option value="REFUNDED">Đã hoàn tiền</option>
      </select>
      <div className="absolute right-3 pointer-events-none text-slate-400">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};
