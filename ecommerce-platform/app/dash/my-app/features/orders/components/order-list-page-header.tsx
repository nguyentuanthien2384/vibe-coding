import React from 'react';
import Link from 'next/link';
import { Plus, ShoppingCart } from 'lucide-react';

export interface OrderListPageHeaderProps {
  totalOrders?: number;
}

export const OrderListPageHeader: React.FC<OrderListPageHeaderProps> = ({ totalOrders }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#4880FF]/10 text-[#4880FF] rounded-2xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202224]">
              Quản lý đơn hàng
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Theo dõi, xử lý và cập nhật tiến trình giao nhận hàng toàn hệ thống
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/orders/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4880FF] hover:bg-[#366be0] text-white font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đơn tại quầy</span>
        </Link>
      </div>
    </div>
  );
};
