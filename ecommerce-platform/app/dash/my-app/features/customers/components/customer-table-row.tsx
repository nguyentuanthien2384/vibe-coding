'use client';

import Link from 'next/link';
import { Eye, ShieldAlert, Edit3, Mail, Phone } from 'lucide-react';
import UserAvatar from '../../../components/ui/user-avatar';
import CustomerStatusBadge from './customer-status-badge';
import CustomerTypeBadge from './customer-type-badge';
import { CustomerListItem } from '../types/customer.types';

interface CustomerTableRowProps {
  customer: CustomerListItem;
  onStatusClick: (customer: CustomerListItem) => void;
  onEditClick: (customer: CustomerListItem) => void;
}

const CustomerTableRow = ({ customer, onStatusClick, onEditClick }: CustomerTableRowProps) => {
  const formattedSpent = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(customer.totalSpent);

  const formattedDate = new Date(customer.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const detailUrl = `/customers/${encodeURIComponent(customer.id)}`;

  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/80 text-sm">
      {/* Tên & Avatar & Type Badge */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <UserAvatar name={customer.fullName} avatarUrl={customer.avatarUrl} size="md" />
          <div>
            <div className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Link
                href={detailUrl}
                className="hover:text-[#4880FF] transition-colors"
              >
                {customer.fullName}
              </Link>
            </div>
            <div className="mt-1">
              <CustomerTypeBadge type={customer.type} />
            </div>
          </div>
        </div>
      </td>

      {/* Thông tin liên hệ (Email / Phone) */}
      <td className="px-6 py-4">
        <div className="space-y-1 text-xs">
          <div className="flex items-center text-slate-600 dark:text-slate-300 font-medium">
            <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {customer.email}
          </div>
          <div className="flex items-center text-slate-500">
            <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {customer.phone}
          </div>
        </div>
      </td>

      {/* Trạng thái tài khoản */}
      <td className="px-6 py-4 text-center">
        <CustomerStatusBadge status={customer.status} />
      </td>

      {/* Đơn hàng & Tổng chi tiêu */}
      <td className="px-6 py-4 text-right">
        <div className="font-extrabold text-[#4880FF] text-base">{formattedSpent}</div>
        <div className="text-xs text-slate-500 font-medium mt-0.5">
          {customer.totalOrders} đơn hàng
        </div>
      </td>

      {/* Ngày khởi tạo */}
      <td className="px-6 py-4 text-center text-xs text-slate-500 font-medium">
        {formattedDate}
      </td>

      {/* Nút thao tác */}
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          {/* Xem Chi Tiết */}
          <Link
            href={detailUrl}
            className="p-1.5 text-slate-500 hover:text-[#4880FF] hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-all"
            title="Xem chi tiết hồ sơ & lịch sử đơn"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {/* Chỉnh Sửa Nhanh */}
          <button
            type="button"
            onClick={() => onEditClick(customer)}
            className="p-1.5 text-slate-500 hover:text-[#4880FF] hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-all"
            title="Chỉnh sửa nhanh khách hàng"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Đổi Trạng Thái */}
          <button
            type="button"
            onClick={() => onStatusClick(customer)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all"
            title="Cập nhật trạng thái tài khoản"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CustomerTableRow;
