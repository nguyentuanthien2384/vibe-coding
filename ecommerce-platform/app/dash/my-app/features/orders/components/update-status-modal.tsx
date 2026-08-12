'use client';

import React from 'react';
import { OrderStatus } from '../types/order.types';
import { OrderStatusBadge } from './order-status-badge';
import { AlertCircle, X } from 'lucide-react';

export interface UpdateStatusModalProps {
  isOpen: boolean;
  orderCode: string;
  currentStatus: OrderStatus;
  targetStatus: OrderStatus;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  orderCode,
  currentStatus,
  targetStatus,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="p-2 bg-blue-50 text-[#4880FF] rounded-2xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Xác nhận đổi trạng thái</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            Bạn có chắc chắn muốn thay đổi trạng thái của đơn hàng{' '}
            <span className="font-mono font-bold text-slate-900">{orderCode}</span> không?
          </p>

          <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <OrderStatusBadge status={currentStatus} />
            <span className="text-slate-400 font-bold">➔</span>
            <OrderStatusBadge status={targetStatus} />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#4880FF] hover:bg-[#366be0] transition-all text-sm shadow-md flex items-center gap-2"
          >
            {isLoading ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};
