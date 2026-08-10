"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOrderDetailApi } from "../../lib/orders";
import { OrderDetailData } from "../../types/auth.types";
import { QRPaymentModal } from "../checkout/modals/qr-payment-modal";
import { showToast } from "../ui/toast";
import { ProfileSidebar } from "../profile/profile-sidebar";
import { useAuthStore } from "../../store/use-auth-store";
import { useCartStore } from "../../store/use-cart-store";
import { logoutApi } from "../../lib/auth";

interface OrderDetailContainerProps {
  orderCode: string;
}

export const OrderDetailContainer: React.FC<OrderDetailContainerProps> = ({
  orderCode,
}) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrderDetailApi(orderCode);
      setOrder(data);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Không thể lấy thông tin chi tiết đơn hàng";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [orderCode]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleLogout = async () => {
    await logoutApi();
    logout();
    await useCartStore.getState().fetchCart();
    showToast({
      message: "Đã đăng xuất thành công! Hẹn gặp lại bạn tại TechBite ⚡",
      type: "info",
    });
    router.push("/login");
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateStr);
    }
  };

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

  // 1. TRẠNG THÁI LOADING (Skeleton UI)
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="hidden lg:block lg:col-span-3 h-96 bg-white border border-gray-100 rounded-2xl"></div>
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 shadow-sm h-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 h-64 shadow-sm"></div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 h-64 shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TRẠNG THÁI ERROR
  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4 text-center">
        <div className="bg-white rounded-2xl p-8 border border-red-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {error || `Đơn hàng mã "${orderCode}" không tồn tại hoặc đã bị xóa.`}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={fetchDetail}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Thử lại
            </button>
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Quay lại Hồ sơ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Define Stepper Statuses
  const statuses = [
    { key: "PENDING", label: "Chờ xử lý", icon: "⏳" },
    { key: "CONFIRMED", label: "Đã xác nhận", icon: "☑️" },
    { key: "PROCESSING", label: "Đang đóng gói", icon: "📦" },
    { key: "SHIPPING", label: "Đang giao hàng", icon: "🚚" },
    { key: "DELIVERED", label: "Đã giao hàng", icon: "🎉" },
  ];

  const currentStatusIndex =
    order.orderStatus === "CANCELLED"
      ? -1
      : statuses.findIndex((s) => s.key === order.orderStatus);

  const isPaid = order.paymentStatus === "PAID";
  const isCancelled = order.orderStatus === "CANCELLED";

  const reorderOrder = useCartStore((state) => state.reorderOrder);

  const handleReorder = async () => {
    if (!order || !order.orderItems || order.orderItems.length === 0) return;
    await reorderOrder(
      order.orderItems.map((item) => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        productName: item.productName,
      }))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors"
        >
          <span>←</span>
          <span>Quay lại Lịch sử đơn hàng</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReorder}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <span>🛒</span>
            <span>Mua lại đơn này</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <span>🖨️</span>
            <span>In đơn hàng</span>
          </button>
        </div>
      </div>

      {/* Responsive 12 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Profile Sidebar (Nằm bên trái nếu đã đăng nhập) */}
        {user && (
          <aside className="lg:col-span-3 md:col-span-4 w-full min-w-0 hidden md:block">
            <ProfileSidebar
              user={user}
              activeTab="orders"
              onTabChange={(tab) => {
                router.push(`/profile?tab=${tab}`);
              }}
              onLogout={handleLogout}
            />
          </aside>
        )}

        {/* Right Main Content (12 col hoặc 9 col) */}
        <div className={`${user ? "lg:col-span-9 md:col-span-8" : "col-span-12"} space-y-6 min-w-0`}>
          {/* Main Order Header Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Đơn hàng {order.orderCode}
                  </h1>
                  <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                    {order.paymentMethod}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Thời gian đặt:{" "}
                  <span className="font-semibold text-slate-800">
                    {formatDate(order.createdAt)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {isPaid ? "✓ Đã thanh toán" : "💳 Chờ thanh toán"}
                </span>
                <span
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border ${
                    isCancelled
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {order.orderStatus === "CONFIRMED"
                    ? "☑️ Đã xác nhận"
                    : order.orderStatus === "SHIPPING"
                    ? "🚚 Đang giao hàng"
                    : order.orderStatus === "DELIVERED"
                    ? "🎉 Đã giao hàng"
                    : isCancelled
                    ? "✕ Đã hủy"
                    : "⏳ Chờ xử lý"}
                </span>
              </div>
            </div>

            {/* Stepper Timeline (Nếu không bị Hủy) */}
            {!isCancelled ? (
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Tiến trình đơn hàng:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {statuses.map((st, idx) => {
                    const isPassed = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;
                    return (
                      <div
                        key={st.key}
                        className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? "bg-orange-50 border-orange-300 shadow-sm"
                            : isPassed
                            ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                            : "bg-slate-50/50 border-slate-200 text-slate-400"
                        }`}
                      >
                        <span className="text-xl mb-1">{st.icon}</span>
                        <span className="text-xs font-bold leading-tight">
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 font-medium">
                ⚠️ Đơn hàng này đã bị hủy. Nếu có thắc mắc, quý khách vui lòng liên hệ tổng đài 1900-1234 để được hỗ trợ.
              </div>
            )}

            {/* Payment Confirmation Banner */}
            {order.paidAt && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs sm:text-sm text-emerald-800 font-medium flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span>Đơn hàng đã được xác nhận thanh toán thành công</span>
                </span>
                <span className="font-bold">{formatDate(order.paidAt)}</span>
              </div>
            )}

            {/* Prompt QR Modal Button if pending QR */}
            {!isPaid &&
              order.paymentMethod === "QR_CODE" &&
              order.qrInfo &&
              !isCancelled && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs sm:text-sm text-amber-900 font-medium">
                    <p className="font-bold">Chưa nhận được thanh toán VietQR</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Quét mã QR Code chuyển khoản để đơn hàng được tự động xác nhận ngay.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
                  >
                    📱 Mở mã QR Code
                  </button>
                </div>
              )}
          </div>

          {/* 2 Columns: Items List & Customer Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Product Items */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>🛒</span>
                <span>Danh sách sản phẩm ({order.itemsCount})</span>
              </h2>

              <div className="divide-y divide-slate-100 space-y-4">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between pt-4 first:pt-0 gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {item.productImageUrl ? (
                        <Image
                          src={item.productImageUrl}
                          alt={item.productName}
                          width={56}
                          height={56}
                          className="w-14 h-14 object-cover rounded-xl bg-slate-50 border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400 text-lg">
                          📦
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                          {item.productName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatPrice(item.price)} ×{" "}
                          <span className="font-bold text-slate-800">
                            {item.quantity}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm shrink-0">
                      {formatPrice(item.itemTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs sm:text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(
                      order.totalAmount + order.discountAmount - order.shippingFee
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Phí vận chuyển (
                    {order.shippingMethod === "EXPRESS" ? "Hỏa tốc" : "Tiêu chuẩn"})
                  </span>
                  <span className="font-bold text-slate-900">
                    {order.shippingFee === 0
                      ? "Miễn phí"
                      : formatPrice(order.shippingFee)}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá Voucher</span>
                    <span className="font-bold">
                      -{formatPrice(order.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center text-base font-extrabold text-slate-900">
                  <span>Tổng tiền thanh toán</span>
                  <span className="text-xl text-red-600 font-extrabold">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Customer & Delivery Info */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>📍</span>
                <span>Thông tin nhận hàng</span>
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Người nhận:
                  </p>
                  <p className="font-extrabold text-slate-900 text-base mt-0.5">
                    {order.customerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Số điện thoại:
                  </p>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {order.customerPhone}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email:
                  </p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {order.customerEmail}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Địa chỉ giao hàng:
                  </p>
                  <p className="font-semibold text-slate-800 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {order.shippingAddress}
                  </p>
                </div>

                {order.orderNote && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Ghi chú đơn hàng:
                    </p>
                    <p className="text-xs text-slate-600 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100 mt-0.5">
                      "{order.orderNote}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Payment Modal */}
      {order.qrInfo && (
        <QRPaymentModal
          isOpen={isQrModalOpen}
          orderCode={order.orderCode}
          qrInfo={order.qrInfo}
          onClose={() => setIsQrModalOpen(false)}
          onPaymentSuccess={() => {
            setIsQrModalOpen(false);
            showToast({
              message: "Thanh toán VietQR thành công!",
              type: "success",
            });
            fetchDetail();
          }}
        />
      )}
    </div>
  );
};
