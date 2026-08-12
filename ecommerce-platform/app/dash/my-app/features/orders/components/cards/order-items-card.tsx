import React from 'react';
import Image from 'next/image';
import { OrderItem } from '../../types/order.types';
import { getImageUrl } from '@/lib/image-url';
import { Package } from 'lucide-react';

export interface OrderItemsCardProps {
  items: OrderItem[];
}

export const OrderItemsCard: React.FC<OrderItemsCardProps> = ({ items }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <h3>Danh sách món ăn / sản phẩm ({items.length})</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Sản phẩm</th>
              <th className="py-3 px-4 text-center">Số lượng</th>
              <th className="py-3 px-4 text-right">Đơn giá</th>
              <th className="py-3 px-4 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const imgSrc = getImageUrl(
                item.productImageUrl || item.productImage,
                '/uploads/images/default.png'
              );
              const totalAmount = item.itemTotal ?? item.subtotal ?? item.price * item.quantity;
              return (
                <tr key={item.id} className="text-sm">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                        <Image
                          src={imgSrc}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block line-clamp-1">
                          {item.productName}
                        </span>
                        <span className="text-xs text-slate-400">Mã SP: #{item.productId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-3 py-1 bg-slate-100 font-bold text-xs rounded-lg text-slate-700">
                      x{item.quantity}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-slate-600">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-4 px-4 text-right font-extrabold text-slate-900">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
