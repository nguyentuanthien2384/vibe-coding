import React from 'react';
import { PaymentMethod, PaymentStatus } from '../../types/order.types';
import { PaymentStatusBadge } from '../payment-status-badge';
import { QuickPaymentStatusDropdown } from '../quick-payment-status-dropdown';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export interface PaymentInfoCardProps {
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  onUpdatePaymentStatus?: (newStatus: PaymentStatus) => void;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: 'Thanh toán khi nhận hàng (COD)',
  VIETQR: 'Chuyển khoản VietQR Code',
  QR_CODE: 'Chuyển khoản VietQR Code',
  BANK_TRANSFER: 'Chuyển khoản Ngân hàng',
};

export const PaymentInfoCard: React.FC<PaymentInfoCardProps> = ({
  method,
  status,
  paidAt,
  onUpdatePaymentStatus,
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base mb-3">
          <div className="p-2 bg-blue-50 text-[#4880FF] rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3>Thông tin thanh toán</h3>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Phương thức</span>
            <span className="font-bold text-slate-800">{METHOD_LABELS[method] || method}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400 font-medium">Trạng thái</span>
            <div className="flex items-center gap-1">
              <PaymentStatusBadge status={status} />
              {onUpdatePaymentStatus && (
                <QuickPaymentStatusDropdown
                  currentStatus={status}
                  onSelectStatus={onUpdatePaymentStatus}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {paidAt && (
        <div className="pt-3 border-t border-gray-100 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Thanh toán lúc: {paidAt}</span>
        </div>
      )}
    </div>
  );
};

