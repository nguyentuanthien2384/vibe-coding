'use client';

import React, { useState, useRef, useEffect } from 'react';
import { OrderStatus } from '../types/order.types';
import { ChevronDown, RefreshCw } from 'lucide-react';

export interface QuickStatusDropdownProps {
  currentStatus: OrderStatus;
  onSelectStatus: (newStatus: OrderStatus) => void;
  isLoading?: boolean;
}

const STATUS_OPTIONS: { id: OrderStatus; label: string; color: string }[] = [
  { id: 'PENDING', label: 'Chờ xác nhận', color: 'text-amber-600 hover:bg-amber-50' },
  { id: 'CONFIRMED', label: 'Đã xác nhận', color: 'text-blue-600 hover:bg-blue-50' },
  { id: 'PROCESSING', label: 'Đang xử lý', color: 'text-purple-600 hover:bg-purple-50' },
  { id: 'SHIPPING', label: 'Đang giao hàng', color: 'text-sky-600 hover:bg-sky-50' },
  { id: 'DELIVERED', label: 'Đã giao', color: 'text-emerald-600 hover:bg-emerald-50' },
  { id: 'CANCELLED', label: 'Đã hủy', color: 'text-rose-600 hover:bg-rose-50' },
  { id: 'REFUNDED', label: 'Đã hoàn tiền', color: 'text-gray-600 hover:bg-gray-50' },
];

export const QuickStatusDropdown: React.FC<QuickStatusDropdownProps> = ({
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

  const handleSelect = (status: OrderStatus) => {
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
        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1"
        title="Đổi trạng thái nhanh"
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-[#4880FF]" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1 w-44 rounded-2xl shadow-xl bg-white border border-gray-100 ring-1 ring-black/5 z-50 p-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-gray-50">
            Chuyển trạng thái
          </div>
          <div className="py-1 space-y-0.5">
            {STATUS_OPTIONS.map((opt) => (
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
