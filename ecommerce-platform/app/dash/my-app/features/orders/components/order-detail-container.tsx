'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { OrderDetailHeader } from './order-detail-header';
import { OrderProgressStepper } from './order-progress-stepper';
import { OrderDetailGrid } from './order-detail-grid';
import { UpdateStatusModal } from './update-status-modal';
import { UpdatePaymentStatusModal } from './update-payment-status-modal';
import { OrderDetail, OrderStatus, PaymentStatus } from '../types/order.types';
import { useToast } from '@/components/ui/toast';
import { ordersApi } from '@/lib/orders-api';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export interface OrderDetailContainerProps {
  orderId: string;
  initialOrder?: OrderDetail;
}

export const OrderDetailContainer: React.FC<OrderDetailContainerProps> = ({
  orderId,
  initialOrder,
}) => {
  const { showToast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(initialOrder || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialOrder);
  const [error, setError] = useState<string | null>(null);

  // Order Status Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OrderStatus>('CONFIRMED');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Payment Status Modal State
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    targetStatus: PaymentStatus;
  } | null>(null);
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);

  // Fetch Order Details
  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getOne(orderId);
      const data = res.data;

      // Standardize Date formats
      const formatDate = (dStr?: string | Date | null) => {
        if (!dStr) return undefined;
        return new Date(dStr).toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      };

      setOrder({
        ...data,
        createdAt: formatDate(data.createdAt) || String(data.createdAt),
        paidAt: formatDate(data.paidAt) || null,
        completedAt: formatDate(data.completedAt) || null,
        cancelledAt: formatDate(data.cancelledAt) || null,
      });
    } catch (err: any) {
      const errMsg = err?.message || 'Không thể tải chi tiết đơn hàng';
      setError(errMsg);
      showToast('error', errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, showToast]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Handlers for Status Change
  const handleOpenStatusModal = () => {
    if (!order) return;
    const statusFlow: Record<OrderStatus, OrderStatus> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PROCESSING',
      PROCESSING: 'SHIPPING',
      SHIPPING: 'DELIVERED',
      DELIVERED: 'DELIVERED',
      CANCELLED: 'CANCELLED',
      REFUNDED: 'REFUNDED',
    };
    setTargetStatus(statusFlow[order.orderStatus] || 'CONFIRMED');
    setIsModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!order) return;

    setIsUpdatingStatus(true);
    try {
      await ordersApi.updateStatus(order.id, {
        orderStatus: targetStatus,
      });

      showToast(
        'success',
        `Đã chuyển đơn hàng ${order.orderCode} sang trạng thái ${targetStatus} thành công!`
      );
      setIsModalOpen(false);
      await fetchOrderDetail();
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handlers for Payment Status Change
  const handleTriggerPaymentStatusChange = (newStatus: PaymentStatus) => {
    setPaymentModal({
      isOpen: true,
      targetStatus: newStatus,
    });
  };

  const handleConfirmPaymentStatusChange = async () => {
    if (!order || !paymentModal) return;

    setIsUpdatingPaymentStatus(true);
    try {
      await ordersApi.updateStatus(order.id, {
        paymentStatus: paymentModal.targetStatus,
      });

      showToast(
        'success',
        `Đã cập nhật trạng thái thanh toán đơn hàng ${order.orderCode} thành ${paymentModal.targetStatus}!`
      );
      setPaymentModal(null);
      await fetchOrderDetail();
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi cập nhật trạng thái thanh toán');
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-white rounded-3xl border border-gray-100 p-4" />
        <div className="h-28 bg-white rounded-3xl border border-gray-100 p-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-white rounded-3xl border border-gray-100 p-6 col-span-1" />
          <div className="h-64 bg-white rounded-3xl border border-gray-100 p-6 col-span-2" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || !order) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          {error || 'Không tìm thấy chi tiết đơn hàng'}
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Đơn hàng không tồn tại hoặc đã bị xóa khỏi hệ thống.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/orders"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm inline-flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Về danh sách đơn hàng
          </Link>
          <button
            onClick={fetchOrderDetail}
            className="px-4 py-2 bg-[#4880FF] hover:bg-[#366be0] text-white font-bold rounded-xl text-sm inline-flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // 3. Success State
  return (
    <div className="space-y-6">
      {/* Header */}
      <OrderDetailHeader
        orderCode={order.orderCode}
        createdAt={order.createdAt}
        orderStatus={order.orderStatus}
        paymentStatus={order.paymentStatus}
        onChangeStatusClick={handleOpenStatusModal}
      />

      {/* Progress Stepper */}
      <OrderProgressStepper status={order.orderStatus} cancelReason={order.cancelReason || undefined} />

      {/* Detail Bento Grid */}
      <OrderDetailGrid
        order={order}
        onUpdatePaymentStatus={handleTriggerPaymentStatusChange}
      />

      {/* Update Order Status Modal */}
      {isModalOpen && (
        <UpdateStatusModal
          isOpen={isModalOpen}
          orderCode={order.orderCode}
          currentStatus={order.orderStatus}
          targetStatus={targetStatus}
          isLoading={isUpdatingStatus}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmStatusChange}
        />
      )}

      {/* Update Payment Status Modal */}
      {paymentModal && (
        <UpdatePaymentStatusModal
          isOpen={paymentModal.isOpen}
          orderCode={order.orderCode}
          currentStatus={order.paymentStatus}
          targetStatus={paymentModal.targetStatus}
          isLoading={isUpdatingPaymentStatus}
          onClose={() => setPaymentModal(null)}
          onConfirm={handleConfirmPaymentStatusChange}
        />
      )}
    </div>
  );
};
