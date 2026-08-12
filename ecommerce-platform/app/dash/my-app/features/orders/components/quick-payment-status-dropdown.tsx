'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PaymentStatus } from '../types/order.types';
import { ChevronDown, RefreshCw } from 'lucide-react';

export interface QuickPaymentStatusDropdownProps {
  currentStatus: PaymentStatus;
  onSelectStatus: (newStatus: PaymentStatus) => void;
  isLoading?: boolean;
}

const PAYMENT_STATUS_OPTIONS: { id: PaymentStatus; label: string; color: string }[] = [
  { id: 'UNPAID', label: 'Chưa thanh toán', color: 'text-red-600 hover:bg-red-50' },
  { id: 'PAID', label: 'Đã thanh toán', color: 'text-emerald-600 hover:bg-emerald-50' },
  { id: 'REFUNDED', label: 'Đã hoàn tiền', color: 'text-amber-600 hover:bg-amber-50' },
];

export const QuickPaymentStatusDropdown: React.FC<QuickPaymentStatusDropdownProps> = ({
  currentStatus,
  onSelectStatus,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (status: PaymentStatus) => {
    if (status !== currentStatus) {
      onSelectStatus(status);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-0.5"
        title="Đổi trạng thái thanh toán"
      >
        {isLoading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4880FF]" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1 w-44 rounded-2xl shadow-xl bg-white border border-gray-100 ring-1 ring-black/5 z-50 p-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-gray-50">
            Trạng thái thanh toán
          </div>
          <div className="py-1 space-y-0.5">
            {PAYMENT_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-between ${opt.color} ${
                  currentStatus === opt.id ? 'font-extrabold bg-slate-50' : ''
                }`}
              >
                <span>{opt.label}</span>
                {currentStatus === opt.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
