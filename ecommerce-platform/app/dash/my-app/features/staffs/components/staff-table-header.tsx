import React from 'react';

export default function StaffTableHeader() {
  return (
    <thead className="bg-[#F8FAFC]/80 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800">
      <tr>
        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
          NHÂN VIÊN
        </th>
        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
          LIÊN HỆ
        </th>
        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
          VAI TRÒ
        </th>
        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
          TRẠNG THÁI
        </th>
        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
          NGÀY THAM GIA
        </th>
        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
          THAO TÁC
        </th>
      </tr>
    </thead>
  );
}
