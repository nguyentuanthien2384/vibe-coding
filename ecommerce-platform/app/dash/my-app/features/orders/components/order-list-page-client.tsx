'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OrderListPageHeader } from './order-list-page-header';
import { OrderFilterBar } from './order-filter-bar';
import { OrderTable } from './order-table';
import { OrderPagination } from './order-pagination';
import { UpdateStatusModal } from './update-status-modal';
import { UpdatePaymentStatusModal } from './update-payment-status-modal';
import { ExportReportModal } from './export-report-modal';
import { OrderListItem, OrderStatus, PaymentStatus } from '../types/order.types';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/components/ui/toast';
import { ordersApi, AdminOrderSummaryStats } from '@/lib/orders-api';
import { useOrderStatsStore } from '../../../store/order-stats.store';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const OrderListPageClient: React.FC = () => {
  const { showToast } = useToast();

  // Data & UI States
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [summaryStats, setSummaryStats] = useState<AdminOrderSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [activeOrderStatus, setActiveOrderStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [activePaymentStatus, setActivePaymentStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Order Status Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    orderId: string | number;
    orderCode: string;
    currentStatus: OrderStatus;
    targetStatus: OrderStatus;
  } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Payment Status Modal State
  const [paymentStatusModal, setPaymentStatusModal] = useState<{
    isOpen: boolean;
    orderId: string | number;
    orderCode: string;
    currentStatus: PaymentStatus;
    targetStatus: PaymentStatus;
  } | null>(null);
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);

  // Export Report Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Fetch API List Data
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getList({
        search: debouncedSearch,
        orderStatus: activeOrderStatus,
        paymentStatus: activePaymentStatus,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: pageSize,
      });

      // Standardize Date formats for display
      const formattedData = (res.data || []).map((ord) => ({
        ...ord,
        createdAt: new Date(ord.createdAt).toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));

      setOrders(formattedData);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.total || 0);
      setSummaryStats(res.summaryStats || null);
      if (res.summaryStats?.pendingCount !== undefined) {
        useOrderStatsStore.getState().setPendingCount(res.summaryStats.pendingCount);
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Không thể tải danh sách đơn hàng từ máy chủ';
      setError(errMsg);
      showToast('error', errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, activeOrderStatus, activePaymentStatus, startDate, endDate, currentPage, pageSize, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Convert SummaryStats from Backend to StatusCounts map
  const statusCounts: Record<string, number> = React.useMemo(() => {
    if (!summaryStats) {
      return {
        ALL: totalItems,
        PENDING: 0,
        CONFIRMED: 0,
        PROCESSING: 0,
        SHIPPING: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      };
    }
    return {
      ALL: summaryStats.totalOrders,
      PENDING: summaryStats.pendingCount,
      CONFIRMED: summaryStats.confirmedCount,
      PROCESSING: summaryStats.processingCount,
      SHIPPING: summaryStats.shippingCount,
      DELIVERED: summaryStats.deliveredCount,
      CANCELLED: summaryStats.cancelledCount,
    };
  }, [summaryStats, totalItems]);

  // Handlers
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveOrderStatus('ALL');
    setActivePaymentStatus('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleTriggerUpdateStatus = (id: string | number, newStatus: OrderStatus) => {
    const targetOrder = orders.find((o) => String(o.id) === String(id));
    if (!targetOrder) return;

    setStatusModal({
      isOpen: true,
      orderId: id,
      orderCode: targetOrder.orderCode,
      currentStatus: targetOrder.orderStatus,
      targetStatus: newStatus,
    });
  };

  const handleConfirmUpdateStatus = async () => {
    if (!statusModal) return;

    const targetId = statusModal.orderId;
    const newStatus = statusModal.targetStatus;
    const orderCode = statusModal.orderCode;
    const previousStatus = statusModal.currentStatus;

    // 1. Optimistic update: Cập nhật ngay trên UI để phản hồi tức thì không cần F5
    setOrders((prev) =>
      prev.map((ord) =>
        String(ord.id) === String(targetId) ? { ...ord, orderStatus: newStatus } : ord
      )
    );
    setStatusModal(null);
    setIsUpdatingStatus(true);

    try {
      await ordersApi.updateStatus(targetId, {
        orderStatus: newStatus,
      });

      showToast(
        'success',
        `Đã chuyển đơn hàng ${orderCode} sang trạng thái ${newStatus} thành công!`
      );
      await fetchOrders();
      await useOrderStatsStore.getState().fetchPendingCount();
    } catch (err: any) {
      // Rollback
      setOrders((prev) =>
        prev.map((ord) =>
          String(ord.id) === String(targetId) ? { ...ord, orderStatus: previousStatus } : ord
        )
      );
      showToast('error', err?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
      await fetchOrders();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Xác nhận đơn hàng nhanh (1-click) ngay từ bảng đơn hàng
  const handleQuickConfirmOrder = async (id: string | number, orderCode: string) => {
    // 1. Optimistic update
    setOrders((prev) =>
      prev.map((ord) =>
        String(ord.id) === String(id) ? { ...ord, orderStatus: 'CONFIRMED' } : ord
      )
    );

    try {
      await ordersApi.updateStatus(id, {
        orderStatus: 'CONFIRMED',
      });

      showToast('success', `Đã xác nhận đơn hàng ${orderCode} thành công!`);
      await fetchOrders();
      await useOrderStatsStore.getState().fetchPendingCount();
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi xác nhận đơn hàng');
      await fetchOrders();
    }
  };

  const handleTriggerUpdatePaymentStatus = (id: string | number, newStatus: PaymentStatus) => {
    const targetOrder = orders.find((o) => String(o.id) === String(id));
    if (!targetOrder) return;

    setPaymentStatusModal({
      isOpen: true,
      orderId: id,
      orderCode: targetOrder.orderCode,
      currentStatus: targetOrder.paymentStatus,
      targetStatus: newStatus,
    });
  };

  const handleConfirmUpdatePaymentStatus = async () => {
    if (!paymentStatusModal) return;

    const targetId = paymentStatusModal.orderId;
    const newStatus = paymentStatusModal.targetStatus;
    const orderCode = paymentStatusModal.orderCode;
    const previousPaymentStatus = paymentStatusModal.currentStatus;

    // 1. Optimistic update
    setOrders((prev) =>
      prev.map((ord) =>
        String(ord.id) === String(targetId) ? { ...ord, paymentStatus: newStatus } : ord
      )
    );
    setPaymentStatusModal(null);
    setIsUpdatingPaymentStatus(true);

    try {
      await ordersApi.updateStatus(targetId, {
        paymentStatus: newStatus,
      });

      showToast(
        'success',
        `Đã cập nhật trạng thái thanh toán đơn hàng ${orderCode} thành công!`
      );
      await fetchOrders();
      await useOrderStatsStore.getState().fetchPendingCount();
    } catch (err: any) {
      setOrders((prev) =>
        prev.map((ord) =>
          String(ord.id) === String(targetId) ? { ...ord, paymentStatus: previousPaymentStatus } : ord
        )
      );
      showToast('error', err?.message || 'Lỗi khi cập nhật trạng thái thanh toán');
      await fetchOrders();
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <OrderListPageHeader
        totalOrders={summaryStats?.totalOrders || totalItems}
        onExportReport={() => setIsExportModalOpen(true)}
      />

      {/* Error Alert State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-700 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchOrders}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Thử lại
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <OrderFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        activeOrderStatus={activeOrderStatus}
        onOrderStatusChange={(st) => {
          setActiveOrderStatus(st);
          setCurrentPage(1);
        }}
        activePaymentStatus={activePaymentStatus}
        onPaymentStatusChange={(st) => {
          setActivePaymentStatus(st);
          setCurrentPage(1);
        }}
        startDate={startDate}
        onStartDateChange={(d) => {
          setStartDate(d);
          setCurrentPage(1);
        }}
        endDate={endDate}
        onEndDateChange={(d) => {
          setEndDate(d);
          setCurrentPage(1);
        }}
        statusCounts={statusCounts}
        onResetFilters={handleResetFilters}
      />

      {/* Table (handles Loading, Empty & Data states) */}
      <OrderTable
        orders={orders}
        isLoading={isLoading}
        onUpdateStatus={(id, st) => handleTriggerUpdateStatus(id, st)}
        onUpdatePaymentStatus={(id, st) => handleTriggerUpdatePaymentStatus(id, st)}
        onQuickConfirm={handleQuickConfirmOrder}
      />

      {/* Pagination */}
      {!isLoading && !error && orders.length > 0 && (
        <OrderPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(pg) => setCurrentPage(pg)}
        />
      )}

      {/* Confirmation Modals */}
      {statusModal && (
        <UpdateStatusModal
          isOpen={statusModal.isOpen}
          orderCode={statusModal.orderCode}
          currentStatus={statusModal.currentStatus}
          targetStatus={statusModal.targetStatus}
          isLoading={isUpdatingStatus}
          onClose={() => setStatusModal(null)}
          onConfirm={handleConfirmUpdateStatus}
        />
      )}

      {paymentStatusModal && (
        <UpdatePaymentStatusModal
          isOpen={paymentStatusModal.isOpen}
          orderCode={paymentStatusModal.orderCode}
          currentStatus={paymentStatusModal.currentStatus}
          targetStatus={paymentStatusModal.targetStatus}
          isLoading={isUpdatingPaymentStatus}
          onClose={() => setPaymentStatusModal(null)}
          onConfirm={handleConfirmUpdatePaymentStatus}
        />
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentFilters={{
          search: debouncedSearch,
          orderStatus: activeOrderStatus,
          paymentStatus: activePaymentStatus,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }}
      />
    </div>
  );
};
