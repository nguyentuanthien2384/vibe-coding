import React from 'react';
import { OrderStatus } from '../types/order.types';
import { CheckCircle2, Clock, Truck, PackageCheck, AlertOctagon, RefreshCw } from 'lucide-react';

export interface OrderProgressStepperProps {
  status: OrderStatus;
  cancelReason?: string;
}

const STEPS: { id: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { id: 'PENDING', label: 'Khởi tạo đơn', icon: <Clock className="w-4 h-4" /> },
  { id: 'CONFIRMED', label: 'Đã xác nhận', icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'PROCESSING', label: 'Đang chuẩn bị', icon: <RefreshCw className="w-4 h-4" /> },
  { id: 'SHIPPING', label: 'Đang giao hàng', icon: <Truck className="w-4 h-4" /> },
  { id: 'DELIVERED', label: 'Đã giao thành công', icon: <PackageCheck className="w-4 h-4" /> },
];

const STATUS_RANK: Record<OrderStatus, number> = {
  PENDING: 1,
  CONFIRMED: 2,
  PROCESSING: 3,
  SHIPPING: 4,
  DELIVERED: 5,
  CANCELLED: -1,
  REFUNDED: -2,
};

export const OrderProgressStepper: React.FC<OrderProgressStepperProps> = ({
  status,
  cancelReason,
}) => {
  if (status === 'CANCELLED' || status === 'REFUNDED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex items-start gap-4 text-rose-800">
        <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 flex-shrink-0">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-base">
            Đơn hàng {status === 'CANCELLED' ? 'đã bị HỦY' : 'đã HOÀN TIỀN'}
          </h3>
          <p className="text-xs sm:text-sm text-rose-700 mt-1 font-medium">
            {cancelReason || 'Đơn hàng không tiếp tục tiến trình giao nhận.'}
          </p>
        </div>
      </div>
    );
  }

  const currentRank = STATUS_RANK[status] || 1;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Tiến trình đơn hàng
      </h3>

      <div className="relative flex items-center justify-between">
        {/* Connection Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#4880FF] transition-all duration-500 z-0"
          style={{
            width: `${((currentRank - 1) / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        {STEPS.map((step, idx) => {
          const stepRank = idx + 1;
          const isCompleted = stepRank < currentRank;
          const isCurrent = stepRank === currentRank;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-2 group text-center"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                  isCompleted
                    ? 'bg-[#4880FF] text-white shadow-md shadow-blue-200'
                    : isCurrent
                    ? 'bg-[#4880FF] text-white ring-4 ring-blue-100 scale-110 shadow-lg'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`text-xs font-bold max-w-[90px] leading-tight ${
                  isCurrent
                    ? 'text-[#4880FF]'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
