'use client';

import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Download, Calendar, Filter, Loader2 } from 'lucide-react';
import { downloadOrdersReportExcel } from '../api/export-orders-api';

export interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: {
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  };
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  currentFilters,
}) => {
  const [useCurrentFilters, setUseCurrentFilters] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<string>('ALL');
  const [paymentStatus, setPaymentStatus] = useState<string>('ALL');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentFilters) {
      setStartDate(currentFilters.startDate || '');
      setEndDate(currentFilters.endDate || '');
      setOrderStatus(currentFilters.orderStatus || 'ALL');
      setPaymentStatus(currentFilters.paymentStatus || 'ALL');
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setErrorMsg(null);

      const params = useCurrentFilters
        ? {
            search: currentFilters?.search,
            orderStatus: currentFilters?.orderStatus,
            paymentStatus: currentFilters?.paymentStatus,
            paymentMethod: currentFilters?.paymentMethod,
            startDate: currentFilters?.startDate,
            endDate: currentFilters?.endDate,
          }
        : {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            orderStatus: orderStatus !== 'ALL' ? orderStatus : undefined,
            paymentStatus: paymentStatus !== 'ALL' ? paymentStatus : undefined,
          };

      await downloadOrdersReportExcel(params);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi xuất báo cáo Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Xuất báo cáo đơn hàng Excel</h3>
              <p className="text-xs text-slate-500 font-medium">Xuất file Excel (.xlsx) chuẩn 100% không lo lỗi font tiếng Việt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-2xl">
              {errorMsg}
            </div>
          )}

          {/* Radio filter mode selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tùy chọn xuất</label>
            <div className="grid grid-cols-1 gap-2.5">
              <label
                onClick={() => setUseCurrentFilters(true)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  useCurrentFilters
                    ? 'border-[#4880FF] bg-[#4880FF]/5 text-slate-900'
                    : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="exportMode"
                  checked={useCurrentFilters}
                  onChange={() => setUseCurrentFilters(true)}
                  className="mt-0.5 text-[#4880FF] focus:ring-[#4880FF]"
                />
                <div>
                  <span className="block font-extrabold text-sm text-slate-900">Dùng bộ lọc hiện tại trên trang</span>
                  <span className="text-xs text-slate-500">
                    Xuất các đơn hàng đang hiển thị theo từ khóa, trạng thái và khoảng ngày đã chọn
                  </span>
                </div>
              </label>

              <label
                onClick={() => setUseCurrentFilters(false)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  !useCurrentFilters
                    ? 'border-[#4880FF] bg-[#4880FF]/5 text-slate-900'
                    : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="exportMode"
                  checked={!useCurrentFilters}
                  onChange={() => setUseCurrentFilters(false)}
                  className="mt-0.5 text-[#4880FF] focus:ring-[#4880FF]"
                />
                <div>
                  <span className="block font-extrabold text-sm text-slate-900">Cấu hình điều kiện tùy chỉnh</span>
                  <span className="text-xs text-slate-500">
                    Chọn lại khoảng thời gian và lọc trạng thái theo nhu cầu báo cáo riêng
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Custom filters options */}
          {!useCurrentFilters && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Khoảng thời gian</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Từ ngày</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Đến ngày</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span>Trạng thái đơn hàng</span>
                  </label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF]"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="SHIPPING">Đang giao hàng</option>
                    <option value="DELIVERED">Đã hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span>Trạng thái thanh toán</span>
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF]"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chưa thanh toán</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="FAILED">Thất bại</option>
                    <option value="REFUNDED">Đã hoàn tiền</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2.5 text-slate-600 hover:text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kết xuất Excel...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Tải Báo Cáo Excel (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
