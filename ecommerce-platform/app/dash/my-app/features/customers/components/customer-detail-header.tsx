'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Edit3, Plus } from 'lucide-react';
import CustomerStatusBadge from './customer-status-badge';
import CustomerTypeBadge from './customer-type-badge';
import { CustomerDetail } from '../types/customer.types';

interface CustomerDetailHeaderProps {
  customer: CustomerDetail;
  onStatusToggle: () => void;
  onEditClick: () => void;
  onCreateClick: () => void;
}

const CustomerDetailHeader = ({
  customer,
  onStatusToggle,
  onEditClick,
  onCreateClick,
}: CustomerDetailHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#4880FF] mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại danh sách khách hàng
        </Link>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {customer.fullName}
          </h1>
          <CustomerTypeBadge type={customer.type} />
          <CustomerStatusBadge status={customer.status} />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Mã khách hàng: <code className="font-mono text-slate-700 dark:text-slate-300 font-bold">{customer.id}</code>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={onEditClick}
          className="inline-flex items-center px-3.5 py-2 text-xs font-semibold bg-[#4880FF] hover:bg-[#3b6edc] text-white rounded-xl shadow-sm transition-colors"
        >
          <Edit3 className="w-4 h-4 mr-1.5" />
          Sửa thông tin
        </button>

        <button
          onClick={onStatusToggle}
          className="inline-flex items-center px-3.5 py-2 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 transition-colors"
        >
          <ShieldAlert className="w-4 h-4 mr-1.5" />
          Đổi trạng thái
        </button>

        <button
          onClick={onCreateClick}
          className="inline-flex items-center px-3 py-2 text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Thêm mới
        </button>
      </div>
    </div>
  );
};

export default CustomerDetailHeader;
