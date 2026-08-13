'use client';

import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import { PrintInvoiceModal } from './print-invoice-modal';
import { OrderDetail } from '../types/order.types';

export interface PrintInvoiceButtonProps {
  orderCode: string;
  orderData?: OrderDetail | null;
  variant?: 'default' | 'outline' | 'icon';
}

export const PrintInvoiceButton: React.FC<PrintInvoiceButtonProps> = ({
  orderCode,
  orderData,
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-500 hover:text-[#4880FF] hover:bg-[#4880FF]/10 rounded-xl transition-all"
          title={`In hóa đơn #${orderCode}`}
        >
          <Printer className="w-4 h-4" />
        </button>
      ) : variant === 'outline' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-[#4880FF] hover:text-[#4880FF] text-slate-700 font-bold text-xs rounded-xl transition-all"
          title={`In hóa đơn #${orderCode}`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>In HĐ</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4880FF] hover:bg-[#366be0] text-white font-bold text-sm rounded-xl transition-all shadow-sm"
          title={`In hóa đơn ${orderCode}`}
        >
          <Printer className="w-4 h-4" />
          <span>In hóa đơn</span>
        </button>
      )}

      <PrintInvoiceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        orderCode={orderCode}
        orderData={orderData}
      />
    </>
  );
};
