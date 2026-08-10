import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutHeader } from "../../../components/checkout/checkout-header";
import { CheckoutFooter } from "../../../components/checkout/checkout-footer";

export const metadata: Metadata = {
  title: "Đặt hàng thành công - TechBite",
  description: "Cảm ơn bạn đã mua sắm tại TechBite. Đơn hàng của bạn đang được xử lý.",
};

interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    orderCode?: string;
    total?: string;
    payment?: string;
  }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const orderCode = params.orderCode || "TB-982401";
  const total = params.total ? Number(params.total) : 10520000;
  const payment = params.payment || "QR_CODE";

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

  return (
    <div className="bg-gray-50 min-h-screen text-slate-900 flex flex-col">
      <CheckoutHeader currentStep={3} />

      <main className="flex-grow max-w-[1280px] w-full mx-auto px-4 md:px-6 py-12 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-2xl w-full text-center space-y-6">
          {/* Animated Success Checkmark Icon */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm">
            ✓
          </div>

          <div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Đơn hàng thành công
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Cảm ơn bạn đã mua hàng tại TechBite! ⚡
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-2">
              Chúng tôi đã ghi nhận đơn hàng và đang chuẩn bị giao cho bạn trong thời gian sớm nhất.
            </p>
          </div>

          {/* Order Summary Snapshot */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-slate-500 font-medium">Mã đơn hàng:</span>
              <span className="font-mono font-extrabold text-slate-900 text-base">
                {orderCode}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Tổng tiền thanh toán:</span>
              <span className="font-extrabold text-red-600 text-lg">
                {formatPrice(total)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Phương thức:</span>
              <span className="font-bold text-slate-900">
                {payment === "COD"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : "Thanh toán qua VietQR Code"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Trạng thái:</span>
              <span className="bg-emerald-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {payment === "COD" ? "Đã XÁC NHẬN" : "Đã THANH TOÁN"}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200 text-xs text-slate-500">
              🚚 <strong>Thời gian nhận hàng dự kiến:</strong> 1-2 ngày làm việc (TP.HCM / Hà Nội giao trong 2H Hỏa Tốc).
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/profile"
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all text-sm text-center"
            >
              Theo dõi đơn hàng
            </Link>
            <Link
              href="/"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-md shadow-orange-600/25 transition-all text-sm text-center"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </main>

      <CheckoutFooter />
    </div>
  );
}
