'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export interface PrintInvoiceButtonProps {
  orderCode: string;
}

export const PrintInvoiceButton: React.FC<PrintInvoiceButtonProps> = ({ orderCode }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2.5 bg-[#4880FF] hover:bg-[#366be0] text-white font-bold text-sm rounded-xl transition-all shadow-sm"
      title={`In hóa đơn ${orderCode}`}
    >
      <Printer className="w-4 h-4" />
      <span>In hóa đơn</span>
    </button>
  );
};
