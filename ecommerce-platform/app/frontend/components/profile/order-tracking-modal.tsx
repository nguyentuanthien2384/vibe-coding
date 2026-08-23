"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getOrderDetailApi } from "../../lib/orders";
import { OrderDetailData } from "../../types/auth.types";
import { showToast } from "../ui/toast";
import { useCartStore } from "../../store/use-cart-store";
import { getImageUrl } from "../../lib/image-url";
import { Backdrop } from "../ui/backdrop";

interface OrderTrackingModalProps {
  isOpen: boolean;
  orderCode: string | null;
  onClose: () => void;
  onOpenQrPayment?: (orderCode: string) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  orderCode,
  onClose,
  onOpenQrPayment,
}) => {
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const fetchDetail = useCallback(async () => {
    if (!orderCode) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrderDetailApi(orderCode);
      setOrder(data);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [orderCode]);

  useEffect(() => {
    if (isOpen && orderCode) {
      fetchDetail();
    } else {
      setOrder(null);
      setError(null);
    }
  }, [isOpen, orderCode, fetchDetail]);

  if (!isOpen || !orderCode) return null;

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

  // Stepper timeline definition
  const timelineSteps = [
    {
      key: "PENDING",
      title: "Đặt hàng thành công",
      desc: "Đơn hàng đã được ghi nhận vào hệ thống TechBite",
      icon: "📝",
    },
    {
      key: "CONFIRMED",
      title: "Hệ thống xác nhận",
      desc: "Xác nhận đơn hàng & sẵn sàng đóng gói",
      icon: "☑️",
    },
    {
      key: "PROCESSING",
      title: "Đang chuẩn bị & Đóng gói",
      desc: "Nhân viên kiểm kê kho & đóng gói cẩn thận",
      icon: "📦",
    },
    {
      key: "SHIPPING",
      title: "Đang bàn giao vận chuyển",
      desc: "Tài xế TechBite Express đang trên đường giao hàng",
      icon: "🚚",
    },
    {
      key: "DELIVERED",
      title: "Giao hàng thành công",
      desc: "Khách hàng đã nhận đủ sản phẩm & kiểm tra thành công",
      icon: "🎉",
    },
  ];

  const getStepIndex = (status?: string) => {
    if (status === "CANCELLED") return -1;
    return timelineSteps.findIndex((s) => s.key === status);
  };

  const currentStepIdx = getStepIndex(order?.orderStatus);
  const isCancelled = order?.orderStatus === "CANCELLED";
  const isPaid = order?.paymentStatus === "PAID";

  const reorderOrder = useCartStore((state) => state.reorderOrder);

  const handleReorder = async () => {
    if (!order || !order.orderItems || order.orderItems.length === 0) return;
    onClose();
    await reorderOrder(
      order.orderItems.map((item) => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        productName: item.productName,
      }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Backdrop isOpen={isOpen} onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-scaleUp z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-extrabold text-xl">
              🚚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Theo dõi hành trình {orderCode}
                </h3>
                {order && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    {order.paymentMethod}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Chi tiết tiến trình giao hàng theo thời gian thực
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center font-bold text-lg cursor-pointer"
            aria-label="Đóng popup theo dõi"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-12 space-y-6 animate-pulse">
              <div className="h-6 w-48 bg-slate-200 rounded mx-auto"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error || !order ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <p className="text-sm font-bold text-slate-800">
                {error || "Không tìm thấy thông tin đơn hàng"}
              </p>
              <button
                onClick={fetchDetail}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Tải lại
              </button>
            </div>
          ) : (
            <>
              {/* Order Status Header Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/70 gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-slate-500">Thời gian khởi tạo:</p>
                  <p className="font-bold text-slate-800 text-sm">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-extrabold rounded-lg border ${
                      isPaid
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {isPaid ? "✓ Đã thanh toán" : "💳 Chờ thanh toán"}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-extrabold rounded-lg border ${
                      isCancelled
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-orange-50 text-orange-700 border-orange-200"
                    }`}
                  >
                    {isCancelled
                      ? "✕ Đã hủy"
                      : order.orderStatus === "DELIVERED"
                      ? "🎉 Đã giao hàng"
                      : order.orderStatus === "SHIPPING"
                      ? "🚚 Đang giao hàng"
                      : order.orderStatus === "PROCESSING"
                      ? "📦 Đang đóng gói"
                      : order.orderStatus === "CONFIRMED"
                      ? "☑️ Đã xác nhận"
                      : "⏳ Chờ xử lý"}
                  </span>
                </div>
              </div>

              {/* Cancelled Banner if Cancelled */}
              {isCancelled ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 font-medium space-y-1">
                  <p className="font-bold text-sm">⚠️ Đơn hàng đã bị hủy</p>
                  <p>
                    Đơn hàng mã {order.orderCode} đã bị hủy. Nếu bạn đã thanh toán, số tiền sẽ được hoàn trả theo quy định dịch vụ.
                  </p>
                </div>
              ) : (
                /* Stepper Vertical Timeline */
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tiến trình vận chuyển:
                  </h4>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {timelineSteps.map((step, idx) => {
                      const isPassed = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step.key} className="relative flex items-start gap-4">
                          {/* Dot / Icon */}
                          <div
                            className={`absolute -left-6 top-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                              isCurrent
                                ? "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-500/30 ring-4 ring-orange-100 animate-pulse"
                                : isPassed
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "bg-white border-slate-300 text-slate-400"
                            }`}
                          >
                            {isPassed ? "✓" : idx + 1}
                          </div>

                          {/* Details */}
                          <div className="pl-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{step.icon}</span>
                              <h5
                                className={`text-sm font-extrabold ${
                                  isCurrent
                                    ? "text-orange-600"
                                    : isPassed
                                    ? "text-slate-900"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.title}
                              </h5>
                              {isCurrent && (
                                <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full animate-bounce">
                                  Hiện tại
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Address & Customer Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📍</span>
                  <span>Thông tin người nhận</span>
                </h4>
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-extrabold text-slate-900 text-sm">
                    {order.customerName}{" "}
                    <span className="font-semibold text-slate-500">
                      ({order.customerPhone})
                    </span>
                  </p>
                  <p className="text-slate-600">{order.shippingAddress}</p>
                  {order.orderNote && (
                    <p className="text-slate-500 italic pt-1 border-t border-slate-200/60 mt-1">
                      Ghi chú: "{order.orderNote}"
                    </p>
                  )}
                </div>
              </div>

              {/* Purchased Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🛒</span>
                  <span>Sản phẩm trong đơn ({order.itemsCount})</span>
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.productImageUrl ? (
                          <Image
                            src={getImageUrl(item.productImageUrl)}
                            alt={item.productName}
                            width={44}
                            height={44}
                            className="w-11 h-11 object-cover rounded-lg bg-slate-50 border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                            📦
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 line-clamp-1">
                            {item.productName}
                          </p>
                          <p className="text-slate-500">
                            {formatPrice(item.price)} ×{" "}
                            <span className="font-bold text-slate-800">
                              {item.quantity}
                            </span>
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        {formatPrice(item.itemTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-slate-900 border-t border-slate-100">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-base text-red-600">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <Link
            href={`/orders/${orderCode}`}
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-orange-600 underline flex items-center gap-1"
          >
            <span>🔗 Xem chi tiết trang đầy đủ →</span>
          </Link>

          <div className="flex items-center gap-2">
            {!isPaid &&
              order?.paymentMethod === "QR_CODE" &&
              !isCancelled &&
              onOpenQrPayment && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQrPayment(orderCode);
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  💳 Mở VietQR
                </button>
              )}

            {order && (
              <button
                type="button"
                onClick={handleReorder}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🛒</span>
                <span>Mua lại đơn này</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
