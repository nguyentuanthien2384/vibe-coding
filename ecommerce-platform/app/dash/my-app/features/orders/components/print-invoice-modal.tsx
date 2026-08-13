'use client';

import React, { useState } from 'react';
import { X, Printer, FileText, Receipt, Loader2 } from 'lucide-react';
import { InvoicePrintable } from './invoice-printable';
import { OrderDetail } from '../types/order.types';
import { adminFetch } from '@/lib/admin-api';

export interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode: string;
  orderData?: OrderDetail | null;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  isOpen,
  onClose,
  orderCode,
  orderData,
}) => {
  const [printFormat, setPrintFormat] = useState<'A4' | 'THERMAL_80MM'>('A4');
  const [fetchedOrder, setFetchedOrder] = useState<OrderDetail | null>(orderData || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (orderData) {
        setFetchedOrder(orderData);
      } else if (orderCode) {
        setIsLoading(true);
        setErrorMsg(null);
        adminFetch<{ data?: OrderDetail; message?: string }>(`/api/v1/admin/orders/${orderCode}`)
          .then((resData) => {
            if (resData.data) {
              setFetchedOrder(resData.data);
            } else {
              setErrorMsg(resData.message || 'Không thể tải thông tin đơn hàng');
            }
          })
          .catch((err: any) => {
            setErrorMsg(err.message || 'Lỗi kết nối khi tải hóa đơn');
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [isOpen, orderCode, orderData]);

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-100 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#4880FF]/10 text-[#4880FF] rounded-2xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Xem trước hóa đơn #{orderCode}</h3>
              <p className="text-xs text-slate-500 font-medium">Kiểm tra thông tin trước khi thực hiện lệnh in</p>
            </div>
          </div>

          {/* Paper Format Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setPrintFormat('A4')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                printFormat === 'A4'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Khổ A4</span>
            </button>
            <button
              onClick={() => setPrintFormat('THERMAL_80MM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                printFormat === 'THERMAL_80MM'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Bill nhiệt 80mm</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Preview Container */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-200/60 flex justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#4880FF]" />
              <p className="text-xs font-bold">Đang tải hóa đơn đơn hàng #{orderCode}...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 max-w-md text-center text-xs font-bold">
              {errorMsg}
            </div>
          ) : fetchedOrder ? (
            <div className="shadow-xl rounded-2xl overflow-hidden bg-white">
              <InvoicePrintable order={fetchedOrder} printFormat={printFormat} />
            </div>
          ) : null}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
          <p className="text-xs text-slate-400 font-medium">
            * Mẹo: Bạn có thể chọn lưu dưới dạng file PDF trong hộp thoại in của trình duyệt.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all"
            >
              Đóng
            </button>
            <button
              onClick={handleTriggerPrint}
              disabled={!fetchedOrder || isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4880FF] hover:bg-[#366be0] active:scale-95 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-[#4880FF]/20 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>In Hóa Đơn Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
