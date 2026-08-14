'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, ExternalLink } from 'lucide-react';
import { CustomerOrderSummary } from '../../types/customer.types';
import { getCustomerOrders } from '../../api/customers-api';

interface CustomerOrderHistoryCardProps {
  customerId: string;
}

const statusColorMap: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHIPPING: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const CustomerOrderHistoryCard = ({ customerId }: CustomerOrderHistoryCardProps) => {
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 5;

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getCustomerOrders(customerId, page, limit);
        setOrders(res.data);
        setTotal(res.total);
      } catch (err) {
        console.error('Lỗi tải lịch sử đơn hàng:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [customerId, page]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#4880FF]" />
          Lịch Sử Đơn Hàng Dã Đặt ({total})
        </h3>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">Đang tải lịch sử đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">Khách hàng chưa phát sinh đơn hàng nào.</div>
      ) : (
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Mã Đơn Hàng</th>
                  <th className="px-4 py-3">Ngày Đặt</th>
                  <th className="px-4 py-3 text-center">Số Món</th>
                  <th className="px-4 py-3 text-right">Tổng Tiền</th>
                  <th className="px-4 py-3 text-center">Thanh Toán</th>
                  <th className="px-4 py-3 text-center">Trạng Thái</th>
                  <th className="px-4 py-3 text-center">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((ord) => {
                  const formattedSpent = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(ord.totalAmount);

                  const dateStr = new Date(ord.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-white">
                        {ord.orderCode}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{dateStr}</td>
                      <td className="px-4 py-3 text-center font-medium">{ord.itemsCount}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-[#4880FF]">
                        {formattedSpent}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {ord.paymentStatus === 'PAID' ? 'Đã TT' : 'Chờ TT'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            statusColorMap[ord.orderStatus] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/orders/${ord.id}`}
                          className="inline-flex items-center p-1 text-[#4880FF] hover:underline"
                          title="Xem chi tiết đơn hàng này"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phân Trang Nhỏ */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-2.5 py-1 text-xs border rounded-lg disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-xs text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-2.5 py-1 text-xs border rounded-lg disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerOrderHistoryCard;
