'use client';

import React from 'react';
import { OrderDetail, OrderItem } from '../types/order.types';
import { getImageUrl } from '@/lib/image-url';

export interface InvoicePrintableProps {
  order: OrderDetail;
  printFormat?: 'A4' | 'THERMAL_80MM';
}

export const InvoicePrintable: React.FC<InvoicePrintableProps> = ({
  order,
  printFormat = 'A4',
}) => {
  const isThermal = printFormat === 'THERMAL_80MM';

  // Format creation date
  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  // Status mapping and styling
  const paymentStatusMap: Record<string, { label: string; colorClass: string }> = {
    PAID: { label: 'Đã thanh toán', colorClass: 'text-emerald-600 font-bold' },
    PENDING: { label: 'Chờ thanh toán', colorClass: 'text-amber-600 font-bold' },
    UNPAID: { label: 'Chưa thanh toán', colorClass: 'text-amber-600 font-bold' },
    FAILED: { label: 'Thất bại', colorClass: 'text-rose-600 font-bold' },
    EXPIRED: { label: 'Hết hạn', colorClass: 'text-rose-600 font-bold' },
    REFUNDED: { label: 'Đã hoàn tiền', colorClass: 'text-slate-600 font-bold' },
  };

  const statusInfo = paymentStatusMap[order.paymentStatus] || {
    label: order.paymentStatus || 'Chưa xác định',
    colorClass: 'text-slate-900 font-bold',
  };

  // Dynamic Store Info (Can be configured via env)
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'TECHBITE SHOP';
  const storeAddress = process.env.NEXT_PUBLIC_STORE_ADDRESS || '123 Đường ABC, Quận 1, TP. HCM';
  const storeHotline = process.env.NEXT_PUBLIC_STORE_HOTLINE || '1900 1234';
  const storeEmail = process.env.NEXT_PUBLIC_STORE_EMAIL || 'support@techbite.vn';

  // Dynamic Customer Data from Order Object
  const customerName =
    order.shippingAddress?.recipientName ||
    order.customerName ||
    order.customer?.name ||
    'Khách hàng';

  const customerEmail =
    order.customerEmail ||
    order.customer?.email ||
    'Chưa cập nhật';

  const customerPhone =
    order.shippingAddress?.phone ||
    order.customerPhone ||
    order.customer?.phone ||
    'Chưa cập nhật';

  // Dynamic Address Construction
  const addressText = order.shippingAddress
    ? [
        order.shippingAddress.detailAddress,
        order.shippingAddress.wardName,
        order.shippingAddress.districtName,
        order.shippingAddress.provinceName,
      ]
        .filter(Boolean)
        .join(', ')
    : 'Chưa cập nhật địa chỉ';

  const subtotalAmount = order.summary?.subtotal ?? order.totalAmount ?? 0;
  const discountAmount = order.summary?.discountAmount ?? 0;
  const pointsDiscount = order.summary?.pointsDiscount ?? 0;
  const pointsUsed = order.summary?.pointsUsed ?? 0;
  const shippingFee = order.summary?.shippingFee ?? 0;
  const totalAmount = order.summary?.totalAmount ?? order.totalAmount ?? 0;

  return (
    <div
      id="printable-invoice"
      className={`bg-white text-slate-900 mx-auto font-sans leading-tight ${
        isThermal ? 'w-[80mm] p-4 text-[12px]' : 'w-full max-w-[210mm] p-6 text-sm'
      }`}
    >
      {/* Printable CSS override when executing window.print() */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: ${isThermal ? '5mm' : '10mm'} !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: ${isThermal ? '80mm auto' : 'A4 portrait'};
            margin: ${isThermal ? '0mm' : '5mm'};
          }
        }
      `}</style>

      {/* Top Header Row */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-5 mb-5">
        {/* Left Store Info */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-[#1d4ed8] tracking-tight uppercase">
            {storeName}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {storeAddress}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Hotline: {storeHotline} | Email: {storeEmail}
          </p>
        </div>

        {/* Right Invoice Info */}
        <div className="text-right space-y-0.5">
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
            HÓA ĐƠN BÁN HÀNG
          </h2>
          <p className="text-sm font-extrabold text-[#1d4ed8]">
            #{order.orderCode}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Ngày: {formattedDate}
          </p>
        </div>
      </div>

      {/* Section 1: Product List */}
      <div className="mb-6 space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm">
          Danh sách sản phẩm
        </h3>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
              <th className="py-2.5 px-2 text-left">SẢN PHẨM</th>
              <th className="py-2.5 px-2 text-right">ĐƠN GIÁ</th>
              <th className="py-2.5 px-2 text-center w-20">SỐ LƯỢNG</th>
              <th className="py-2.5 px-2 text-right">THÀNH TIỀN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: OrderItem, idx: number) => {
                const itemTotal = item.itemTotal ?? item.subtotal ?? (item.price * item.quantity);
                const imgSrc = getImageUrl(item.productImageUrl || item.productImage);

                return (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded-lg bg-slate-100 flex-shrink-0 border border-slate-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs flex-shrink-0">
                            TB
                          </div>
                        )}
                        <span className="font-bold text-slate-900 text-xs leading-snug">
                          {item.productName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-slate-700 whitespace-nowrap">
                      {item.price.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      {itemTotal.toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400 text-xs font-medium">
                  Không có chi tiết sản phẩm
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Financial Summary Block */}
        <div className="flex justify-end pt-3">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Tạm tính:</span>
              <span className="font-bold text-slate-900">{subtotalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Giảm giá voucher:</span>
                <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            {pointsDiscount > 0 && (
              <div className="flex justify-between text-amber-700 font-medium">
                <span>Trừ điểm ({pointsUsed} điểm):</span>
                <span className="font-bold">-{pointsDiscount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Phí vận chuyển:</span>
              <span className="font-bold text-slate-900">
                {shippingFee > 0 ? `+${shippingFee.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-extrabold text-sm text-slate-900">
              <span>TỔNG CỘNG:</span>
              <span className="text-[#1d4ed8]">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Sections Grid */}
      <div className="space-y-4">
        {/* Section 2: THÔNG TIN KHÁCH HÀNG */}
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-1">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            THÔNG TIN KHÁCH HÀNG
          </p>
          <p className="font-extrabold text-slate-900 text-sm">
            {customerName}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            {customerEmail}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            {customerPhone}
          </p>
        </div>

        {/* Section 3: THÔNG TIN VẬN CHUYỂN */}
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            THÔNG TIN VẬN CHUYỂN
          </p>

          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
              PHƯƠNG THỨC
            </p>
            <p className="text-xs font-bold text-slate-900">
              Giao hàng tiêu chuẩn
            </p>
          </div>

          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
              ĐỊA CHỈ
            </p>
            <p className="text-xs font-bold text-slate-900 leading-normal">
              {addressText}
            </p>
          </div>
        </div>

        {/* Section 4: THÔNG TIN THANH TOÁN */}
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            THÔNG TIN THANH TOÁN
          </p>

          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
              PHƯƠNG THỨC
            </p>
            <p className="text-xs font-bold text-slate-900">
              {order.paymentMethod || 'COD'}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
              TRẠNG THÁI
            </p>
            <p className={`text-xs ${statusInfo.colorClass}`}>
              {statusInfo.label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
