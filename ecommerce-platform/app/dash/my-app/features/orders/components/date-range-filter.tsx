'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

export interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset?: () => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
}) => {
  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-sm">
      <div className="flex items-center gap-1.5 px-2 text-slate-500 font-medium">
        <Calendar className="w-4 h-4 text-slate-400" />
        <span className="hidden sm:inline text-xs">Từ:</span>
      </div>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#4880FF]"
      />
      <span className="text-slate-400 text-xs">-</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#4880FF]"
      />

      {(startDate || endDate) && onReset && (
        <button
          onClick={onReset}
          className="px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          Xóa ngày
        </button>
      )}
    </div>
  );
};
