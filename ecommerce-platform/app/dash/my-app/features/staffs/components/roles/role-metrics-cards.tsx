import React from 'react';
import { Shield, Users, Info } from 'lucide-react';

interface RoleMetricsCardsProps {
  totalGroups: number;
  totalAssignedStaffs: number;
}

export default function RoleMetricsCards({
  totalGroups,
  totalAssignedStaffs,
}: RoleMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* Card 1: Tổng số nhóm */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <Shield className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            TỔNG SỐ NHÓM
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block mt-0.5">
            {totalGroups}
          </span>
        </div>
      </div>

      {/* Card 2: Đã gán nhân sự */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
          <Users className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            ĐÃ GÁN NHÂN SỰ
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block mt-0.5">
            {totalAssignedStaffs} nhân viên
          </span>
        </div>
      </div>

      {/* Card 3: Thông báo ghi chú */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Thay đổi quyền trong nhóm sẽ áp dụng ngay lập tức cho tất cả nhân viên thuộc nhóm đó.
        </p>
      </div>
    </div>
  );
}
