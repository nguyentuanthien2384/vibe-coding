import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { CustomerDetail } from '../../types/customer.types';

interface CustomerFinancialMetricsCardProps {
  customer: CustomerDetail;
}

const CustomerFinancialMetricsCard = ({ customer }: CustomerFinancialMetricsCardProps) => {
  const formattedTotalSpent = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(customer.totalSpent);

  const aovValue = customer.totalOrders > 0 ? Math.round(customer.totalSpent / customer.totalOrders) : 0;
  const formattedAOV = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(aovValue);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
        Chỉ Số Kinh Doanh Khách Hàng
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tổng Chi Tiêu */}
        <div className="bg-blue-50/60 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-xs font-semibold">Tổng Chi Tiêu</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-[#4880FF]">{formattedTotalSpent}</div>
        </div>

        {/* Tổng Số Đơn Hàng */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-semibold">Số Đơn Hàng</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {customer.totalOrders} <span className="text-xs font-normal">đơn</span>
          </div>
        </div>

        {/* Giá Trị Đơn Trung Bình (AOV) */}
        <div className="bg-purple-50/60 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-100 dark:border-purple-900">
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-xs font-semibold">Giá Trị Đơn TB (AOV)</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold text-purple-700 dark:text-purple-400">{formattedAOV}</div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFinancialMetricsCard;
