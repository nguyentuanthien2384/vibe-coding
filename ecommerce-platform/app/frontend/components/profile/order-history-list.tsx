"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { OrderHistoryListProps } from "../../types/auth-ui.types";
import { OrderSummaryItem } from "../../types/auth.types";
import { useDebounce } from "../../hooks/use-debounce";
import { OrderTrackingModal } from "./order-tracking-modal";
import { useCartStore } from "../../store/use-cart-store";
import { showToast } from "../ui/toast";
import { getImageUrl } from "../../lib/image-url";

/** Helper hiển thị badge Trạng thái Đơn hàng (Order Status) */
function getOrderStatusBadge(status?: string) {
  const normalized = (status || "PENDING").toUpperCase();
  switch (normalized) {
    case "PENDING":
      return {
        label: "Chờ xử lý",
        className: "bg-amber-50 text-amber-800 border border-amber-200",
        icon: "⏳",
      };
    case "CONFIRMED":
      return {
        label: "Đã xác nhận",
        className: "bg-blue-50 text-blue-800 border border-blue-200",
        icon: "☑️",
      };
    case "PROCESSING":
      return {
        label: "Đang đóng gói",
        className: "bg-purple-50 text-purple-800 border border-purple-200",
        icon: "📦",
      };
    case "SHIPPING":
      return {
        label: "Đang giao hàng",
        className: "bg-indigo-50 text-indigo-800 border border-indigo-200",
        icon: "🚚",
      };
    case "DELIVERED":
      return {
        label: "Đã giao hàng",
        className: "bg-emerald-50 text-emerald-800 border border-emerald-200",
        icon: "🎉",
      };
    case "CANCELLED":
      return {
        label: "Đã hủy đơn",
        className: "bg-rose-50 text-rose-800 border border-rose-200",
        icon: "✕",
      };
    default:
      return {
        label: status || "Chờ xử lý",
        className: "bg-slate-100 text-slate-700 border border-slate-200",
        icon: "📋",
      };
  }
}

/** Helper hiển thị badge Trạng thái Thanh toán (Payment Status) */
function getPaymentStatusBadge(status?: string, method?: string) {
  const normalized = (status || "PENDING").toUpperCase();
  switch (normalized) {
    case "PAID":
      return {
        label: "Đã thanh toán",
        className: "bg-emerald-100 text-emerald-800 border border-emerald-300",
        icon: "✓",
      };
    case "PENDING":
      return {
        label: method === "COD" ? "Thanh toán COD" : "Chờ chuyển khoản VietQR",
        className: "bg-amber-100 text-amber-800 border border-amber-300",
        icon: "💳",
      };
    case "FAILED":
      return {
        label: "Thanh toán thất bại",
        className: "bg-rose-100 text-rose-800 border border-rose-300",
        icon: "⚠️",
      };
    case "EXPIRED":
      return {
        label: "Mã QR hết hạn",
        className: "bg-slate-100 text-slate-600 border border-slate-300",
        icon: "⏰",
      };
    default:
      return {
        label: "Chờ thanh toán",
        className: "bg-slate-100 text-slate-600 border border-slate-200",
        icon: "💵",
      };
  }
}

// Define Status Filter Tabs list
const statusTabs = [
  { key: "ALL", label: "Tất cả", icon: "📋" },
  { key: "PENDING", label: "Chờ xử lý", icon: "⏳" },
  { key: "CONFIRMED", label: "Đã xác nhận", icon: "☑️" },
  { key: "PROCESSING", label: "Đang đóng gói", icon: "📦" },
  { key: "SHIPPING", label: "Đang giao hàng", icon: "🚚" },
  { key: "DELIVERED", label: "Đã hoàn thành", icon: "🎉" },
  { key: "CANCELLED", label: "Đã hủy", icon: "✕" },
];

export const OrderHistoryList: React.FC<OrderHistoryListProps> = ({
  orders,
  isLoading = false,
  error = null,
  onRefresh,
  onViewAll,
  title,
  showViewAllButton = true,
  selectedStatus = "ALL",
  onStatusChange,
  searchQuery = "",
  onSearchChange,
  statusCounts,
  onOpenQrPayment,
  pagination,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | number | null>(
    null
  );

  // Search input state with Debounce
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Tracking Modal State
  const [trackingOrderCode, setTrackingOrderCode] = useState<string | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // Sync debounced search to parent handler
  useEffect(() => {
    if (onSearchChange && debouncedSearch !== searchQuery) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange, searchQuery]);

  const toggleExpand = (id: string | number) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const openTracking = (orderCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTrackingOrderCode(orderCode);
    setIsTrackingModalOpen(true);
  };

  const reorderOrder = useCartStore((state) => state.reorderOrder);

  const handleReorder = async (order: OrderSummaryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!order.orderItems || order.orderItems.length === 0) {
      showToast({
        message: "Không thể lấy danh sách sản phẩm để mua lại",
        type: "error",
      });
      return;
    }

    await reorderOrder(
      order.orderItems.map((item) => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        productName: item.productName,
      }))
    );
  };

  const formatDate = (dateStr: string | Date) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
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

  // 1. TRẠNG THÁI LOADING (Skeleton List)
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6 animate-pulse">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="h-6 w-44 bg-gray-200 rounded-md"></div>
          <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-gray-100 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                    <div className="h-3 w-36 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. TRẠNG THÁI ERROR (Có nút Thử lại)
  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Không thể tải lịch sử đơn hàng
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            Thử lại
          </button>
        )}
      </div>
    );
  }

  // 3. TRẠNG THÁI SUCCESS / EMPTY
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 animate-fadeIn space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-wrap gap-3">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <span>📦</span>
          <span>{title || `Theo dõi đơn hàng (${orders.length})`}</span>
        </h2>
        <div className="flex items-center gap-3">
          {onViewAll && showViewAllButton && (
            <button
              onClick={onViewAll}
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Xem tất cả →</span>
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>🔄</span>
              <span>Làm mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar Controls (Nếu có handler status hoặc search) */}
      {(onStatusChange || onSearchChange) && (
        <div className="space-y-4">
          {/* Status Filter Horizontal Tabs */}
          {onStatusChange && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-gray-100">
              {statusTabs.map((tab) => {
                const isActive = selectedStatus === tab.key;
                const count =
                  statusCounts && statusCounts[tab.key as keyof typeof statusCounts] !== undefined
                    ? statusCounts[tab.key as keyof typeof statusCounts]
                    : null;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onStatusChange(tab.key)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {count !== null && (
                      <span
                        className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          isActive
                            ? "bg-orange-600 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search Box with Debounce */}
          {onSearchChange && (
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm đơn hàng theo mã (TB-XXXXXX) hoặc tên món ăn..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all bg-slate-50/50"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🔍
              </span>
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold p-1"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">
            🛍️
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery
              ? `Không tìm thấy đơn hàng phù hợp với "${searchQuery}"`
              : selectedStatus !== "ALL"
              ? "Chưa có đơn hàng trong trạng thái này"
              : "Bạn chưa có đơn hàng nào"}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Khám phá các sản phẩm công nghệ hot nhất tại TechBite và đặt hàng ngay!
          </p>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-5">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const itemsCount =
              order.itemCount || (order.orderItems ? order.orderItems.length : 1);

            const orderStatusBadge = getOrderStatusBadge(
              order.orderStatus || order.status
            );
            const paymentStatusBadge = getPaymentStatusBadge(
              order.paymentStatus || order.status,
              order.paymentMethod
            );

            const isPendingQr =
              order.paymentMethod === "QR_CODE" &&
              order.paymentStatus === "PENDING" &&
              order.orderStatus !== "CANCELLED";

            const isCancelled = order.orderStatus === "CANCELLED";

            // Mini Stepper progress calculations
            const stepperStages = [
              { key: "PENDING", label: "Chờ xử lý" },
              { key: "CONFIRMED", label: "Xác nhận" },
              { key: "PROCESSING", label: "Đóng gói" },
              { key: "SHIPPING", label: "Đang giao" },
              { key: "DELIVERED", label: "Đã giao" },
            ];
            const currentStageIdx = isCancelled
              ? -1
              : stepperStages.findIndex(
                  (s) => s.key === (order.orderStatus || order.status)
                );

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all hover:border-orange-200 hover:shadow-md"
              >
                {/* Order Header Summary Row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 cursor-pointer select-none gap-4"
                >
                  {/* Left Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 font-extrabold text-xl shadow-sm">
                      ⚡
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/orders/${order.orderCode}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-extrabold text-slate-900 hover:text-orange-600 text-base transition-colors"
                        >
                          {order.orderCode}
                        </Link>
                        {order.paymentMethod && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {order.paymentMethod}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(order.createdAt)} • {itemsCount} sản phẩm
                      </p>
                    </div>
                  </div>

                  {/* Right Status Badges & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right space-y-1">
                      <p className="font-extrabold text-base text-red-600">
                        {formatPrice(order.totalAmount)}
                      </p>

                      {/* Dual Status Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-start sm:justify-end">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-md ${orderStatusBadge.className}`}
                        >
                          <span>{orderStatusBadge.icon}</span>
                          <span>{orderStatusBadge.label}</span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-md ${paymentStatusBadge.className}`}
                        >
                          <span>{paymentStatusBadge.icon}</span>
                          <span>{paymentStatusBadge.label}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-orange-600 transition-transform duration-200 shrink-0"
                      aria-label="Xem chi tiết đơn hàng"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-orange-600" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Horizontal Mini Stepper Progress (Nếu không bị Hủy) */}
                {!isCancelled ? (
                  <div className="px-5 py-3 bg-slate-50/70 border-t border-b border-gray-100 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
                    {stepperStages.map((stg, idx) => {
                      const isPassed = idx <= currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <React.Fragment key={stg.key}>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all ${
                                isCurrent
                                  ? "bg-orange-600 text-white shadow-sm ring-2 ring-orange-200 animate-pulse"
                                  : isPassed
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {isPassed ? "✓" : idx + 1}
                            </span>
                            <span
                              className={`text-xs font-bold whitespace-nowrap ${
                                isCurrent
                                  ? "text-orange-600"
                                  : isPassed
                                  ? "text-slate-800"
                                  : "text-slate-400"
                              }`}
                            >
                              {stg.label}
                            </span>
                          </div>

                          {idx < stepperStages.length - 1 && (
                            <div
                              className={`h-0.5 flex-1 min-w-[16px] rounded transition-all ${
                                idx < currentStageIdx
                                  ? "bg-emerald-500"
                                  : "bg-slate-200"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-5 py-2 bg-rose-50/60 border-t border-b border-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>Đơn hàng này đã bị hủy</span>
                  </div>
                )}

                {/* Quick Action Toolbar */}
                <div className="px-5 py-3 bg-white flex items-center justify-between flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={(e) => openTracking(order.orderCode, e)}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-orange-200/60 shadow-2xs"
                  >
                    <span>🚚</span>
                    <span>Theo dõi hành trình</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isPendingQr && onOpenQrPayment && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQrPayment(order.orderCode);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-sm cursor-pointer"
                      >
                        💳 Thanh toán VietQR
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleReorder(order, e)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>🛒</span>
                      <span>Mua lại</span>
                    </button>

                    <Link
                      href={`/orders/${order.orderCode}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                    >
                      Chi tiết →
                    </Link>
                  </div>
                </div>

                {/* Expanded Item Details */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-gray-100 p-4 sm:p-5 space-y-3 animate-fadeIn">
                    {order.paidAt && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-medium flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="text-base">✅</span>
                          <span>Đã xác nhận thanh toán thành công</span>
                        </span>
                        <span className="font-bold">{formatDate(order.paidAt)}</span>
                      </div>
                    )}

                    {order.orderItems && order.orderItems.length > 0 && (
                      <>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Danh sách món mua:
                        </p>
                        <div className="divide-y divide-gray-200/60 space-y-2">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between pt-2 first:pt-0 gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {item.productImageUrl ? (
                                  <Image
                                    src={getImageUrl(item.productImageUrl)}
                                    alt={item.productName}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 object-cover rounded-xl bg-white border border-gray-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shrink-0 flex items-center justify-center text-slate-400 text-xs">
                                    📦
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-800 line-clamp-1">
                                    {item.productName}
                                  </p>
                                  <p className="text-slate-500">
                                    {formatPrice(item.price)} × {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-slate-900 shrink-0">
                                {formatPrice(item.itemTotal)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Financial Breakdown */}
                        <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-1.5 text-xs text-slate-600">
                          {order.shippingFee !== undefined && (
                            <div className="flex justify-between">
                              <span>Phí vận chuyển:</span>
                              <span className="font-semibold text-slate-800">
                                {order.shippingFee === 0
                                  ? "Miễn phí"
                                  : `+${formatPrice(order.shippingFee)}`}
                              </span>
                            </div>
                          )}

                          {order.discountAmount !== undefined && order.discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                              <span>
                                Mã giảm giá {order.voucherCode ? `(${order.voucherCode})` : ""}:
                              </span>
                              <span className="font-bold">
                                -{formatPrice(order.discountAmount)}
                              </span>
                            </div>
                          )}

                          {((order.pointsDiscount || 0) > 0 || (order.pointsUsed || 0) > 0) && (
                            <div className="flex justify-between text-amber-700 font-medium bg-amber-50/70 px-2 py-1 rounded-md border border-amber-200/50">
                              <span>
                                ⭐️ Trừ điểm {order.pointsUsed ? `(${order.pointsUsed} điểm)` : ""}:
                              </span>
                              <span className="font-bold text-amber-800">
                                -{formatPrice(order.pointsDiscount || 0)}
                              </span>
                            </div>
                          )}

                          {(order.pointsEarned || 0) > 0 && (
                            <div className="flex justify-between text-indigo-600 text-[11px] font-medium">
                              <span>✨ Tích lũy từ đơn:</span>
                              <span className="font-bold">+{order.pointsEarned} điểm</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 font-bold text-slate-900 text-sm">
                            <span>Tổng thanh toán:</span>
                            <span className="text-red-600 text-base font-extrabold">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-5 flex-wrap gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Hiển thị trang <span className="font-bold text-slate-900">{pagination.page}</span> /{" "}
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> (Tổng{" "}
            {pagination.total} đơn hàng)
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              ← Trang trước
            </button>

            {Array.from({ length: pagination.totalPages }, (_, index) => {
              const pageNum = index + 1;
              const isActive = pageNum === pagination.page;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Trang sau →
            </button>
          </div>
        </div>
      )}

      {/* Order Tracking Timeline Modal */}
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        orderCode={trackingOrderCode}
        onClose={() => setIsTrackingModalOpen(false)}
        onOpenQrPayment={onOpenQrPayment}
      />
    </div>
  );
};
