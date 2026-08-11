"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  EmailLog,
  EmailType,
  EmailStatus,
  EmailLogQueryDto,
  EmailLogsPagination,
} from '@/types/email-log.types';
import { getEmailLogsApi, resendEmailApi } from '@/lib/email-log';
import { useAuthStore } from '@/store/use-auth-store';
import { showToast } from '@/components/ui/toast';

const TYPE_LABEL_MAP: Record<EmailType, { label: string; bgClass: string; textClass: string; borderClass: string; icon: string }> = {
  REGISTER_WELCOME: {
    label: 'Đăng ký tài khoản',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    icon: '🎉',
  },
  ORDER_CONFIRMATION: {
    label: 'Xác nhận đơn hàng',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    icon: '📦',
  },
  PASSWORD_CHANGED: {
    label: 'Đổi mật khẩu',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    icon: '🔑',
  },
  SECURITY_ALERT: {
    label: 'Cảnh báo bảo mật',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    icon: '🛡️',
  },
};

const STATUS_BADGE_MAP: Record<EmailStatus, { label: string; bg: string; text: string; dotBg: string }> = {
  SENT: {
    label: 'Thành công',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    dotBg: 'bg-emerald-500',
  },
  PENDING: {
    label: 'Đang chờ',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    dotBg: 'bg-amber-500',
  },
  FAILED: {
    label: 'Thất bại',
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-700',
    dotBg: 'bg-rose-500',
  },
};

export const EmailLogManagement: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // States
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [pagination, setPagination] = useState<EmailLogsPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<EmailType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<EmailStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Resend State (tracks log id being resent)
  const [resendingId, setResendingId] = useState<number | null>(null);

  // Modal State for detail view
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  // Fetch email logs
  const fetchEmailLogs = useCallback(
    async (page = currentPage, type = selectedType, status = selectedStatus, search = searchQuery) => {
      try {
        setIsLoading(true);
        setError(null);

        const params: EmailLogQueryDto = {
          page,
          limit: 10,
          type: type || undefined,
          status: status || undefined,
          search: search || undefined,
        };

        const res = await getEmailLogsApi(params);
        setLogs(res.items || []);
        if (res.pagination) {
          setPagination(res.pagination);
          setCurrentPage(res.pagination.page);
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Không thể lấy danh sách nhật ký email. Vui lòng kiểm tra quyền Admin.';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, selectedType, selectedStatus, searchQuery]
  );

  useEffect(() => {
    fetchEmailLogs(1, selectedType, selectedStatus, searchQuery);
  }, [selectedType, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmailLogs(1, selectedType, selectedStatus, searchQuery);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedStatus('');
    setCurrentPage(1);
    fetchEmailLogs(1, '', '', '');
  };

  const handleResend = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      setResendingId(id);
      const res = await resendEmailApi(id);
      showToast({
        message: res.message || `Đã gửi lại email ID #${id} thành công!`,
        type: 'success',
      });
      // Refresh list
      fetchEmailLogs(currentPage, selectedType, selectedStatus, searchQuery);
      // If modal is open with this log, update modal status
      if (selectedLog && selectedLog.id === id) {
        setSelectedLog({ ...selectedLog, status: 'SENT', errorMessage: null });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gửi lại email thất bại.';
      showToast({
        message: errorMsg,
        type: 'error',
      });
    } finally {
      setResendingId(null);
    }
  };

  // Quick stats computed from current view / totals
  const totalCount = pagination.total;
  const sentCount = logs.filter((l) => l.status === 'SENT').length;
  const pendingCount = logs.filter((l) => l.status === 'PENDING').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
              ⚡ Admin Email Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quản lý Nhật ký Email Notification
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Theo dõi lịch sử gửi email tự động (Đăng ký, Đơn hàng, Đổi mật khẩu, Cảnh báo bảo mật) và kích hoạt gửi lại khi xảy ra sự cố.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchEmailLogs(currentPage, selectedType, selectedStatus, searchQuery)}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Stats Grid inside Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
            <p className="text-xs font-medium text-slate-400">Tổng Email</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">{totalCount}</p>
          </div>

          <div className="bg-emerald-950/40 rounded-2xl p-4 border border-emerald-800/40 backdrop-blur-sm">
            <p className="text-xs font-medium text-emerald-400">Đã gửi (Trang này)</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">{sentCount}</p>
          </div>

          <div className="bg-amber-950/40 rounded-2xl p-4 border border-amber-800/40 backdrop-blur-sm">
            <p className="text-xs font-medium text-amber-400">Đang chờ (Trang này)</p>
            <p className="text-xl sm:text-2xl font-black text-amber-300 mt-1">{pendingCount}</p>
          </div>

          <div className="bg-rose-950/40 rounded-2xl p-4 border border-rose-800/40 backdrop-blur-sm">
            <p className="text-xs font-medium text-rose-400">Thất bại (Trang này)</p>
            <p className="text-xl sm:text-2xl font-black text-rose-300 mt-1">{failedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              placeholder="Tìm theo email người nhận hoặc tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400 text-slate-900"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Email Type Select */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as EmailType | '')}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-700 font-medium cursor-pointer"
            >
              <option value="">-- Tất cả loại Email --</option>
              <option value="REGISTER_WELCOME">🎉 Đăng ký tài khoản</option>
              <option value="ORDER_CONFIRMATION">📦 Xác nhận đơn hàng</option>
              <option value="PASSWORD_CHANGED">🔑 Đổi mật khẩu</option>
              <option value="SECURITY_ALERT">🛡️ Cảnh báo bảo mật</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as EmailStatus | '')}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-700 font-medium cursor-pointer"
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="SENT">✅ Thành công (SENT)</option>
              <option value="PENDING">⏳ Đang chờ (PENDING)</option>
              <option value="FAILED">❌ Thất bại (FAILED)</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="sm:col-span-1 flex gap-2 justify-end">
            {(searchQuery || selectedType || selectedStatus) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                title="Xóa bộ lọc"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-bold text-xl">
            ⚠️
          </div>
          <h3 className="text-base font-bold text-rose-900">Lỗi khi tải nhật ký email</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchEmailLogs(1, selectedType, selectedStatus, searchQuery)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/80 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-100 rounded-md w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl w-full"></div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-3xl">
            📬
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không tìm thấy nhật ký email nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Không có bản ghi email logs trùng khớp với điều kiện tìm kiếm hiện tại của bạn.
          </p>
          {(searchQuery || selectedType || selectedStatus) && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Email Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Loại Email</th>
                  <th className="py-3.5 px-4">Người nhận (Recipient)</th>
                  <th className="py-3.5 px-4">Tiêu đề (Subject)</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map((log) => {
                  const typeInfo = TYPE_LABEL_MAP[log.type] || {
                    label: log.type,
                    bgClass: 'bg-slate-50',
                    textClass: 'text-slate-700',
                    borderClass: 'border-slate-200',
                    icon: '✉️',
                  };
                  const statusInfo = STATUS_BADGE_MAP[log.status] || {
                    label: log.status,
                    bg: 'bg-slate-50 border-slate-200',
                    text: 'text-slate-700',
                    dotBg: 'bg-slate-400',
                  };

                  const formattedDate = new Date(log.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const isResendingThis = resendingId === log.id;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-orange-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-slate-400 group-hover:text-orange-600">
                        #{log.id}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold text-[11px] ${typeInfo.bgClass} ${typeInfo.textClass} ${typeInfo.borderClass}`}
                        >
                          <span>{typeInfo.icon}</span>
                          <span>{typeInfo.label}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-900 max-w-[200px] truncate">
                        {log.recipient}
                      </td>

                      <td className="py-4 px-4 text-slate-600 max-w-[260px] truncate">
                        {log.subject}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotBg}`} />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-medium">
                        {formattedDate}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => handleResend(log.id, e)}
                          disabled={isResendingThis}
                          className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-[11px] transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                          title="Gửi lại email này"
                        >
                          {isResendingThis ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          )}
                          <span>{isResendingThis ? 'Đang gửi...' : 'Gửi lại'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium">
                Hiển thị trang <span className="font-bold text-slate-900">{pagination.page}</span> /{' '}
                <span className="font-bold text-slate-900">{pagination.totalPages}</span> (Tổng{' '}
                <span className="font-bold text-slate-900">{pagination.total}</span> bản ghi)
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const newP = currentPage - 1;
                    setCurrentPage(newP);
                    fetchEmailLogs(newP, selectedType, selectedStatus, searchQuery);
                  }}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  &larr; Trước
                </button>

                {[...Array(pagination.totalPages)].map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => {
                        setCurrentPage(pNum);
                        fetchEmailLogs(pNum, selectedType, selectedStatus, searchQuery);
                      }}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        pNum === currentPage
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    const newP = currentPage + 1;
                    setCurrentPage(newP);
                    fetchEmailLogs(newP, selectedType, selectedStatus, searchQuery);
                  }}
                  disabled={currentPage >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sau &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                    LOG #{selectedLog.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                      STATUS_BADGE_MAP[selectedLog.status]?.bg || ''
                    } ${STATUS_BADGE_MAP[selectedLog.status]?.text || ''}`}
                  >
                    {STATUS_BADGE_MAP[selectedLog.status]?.label || selectedLog.status}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedLog.subject}</h3>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Người nhận</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5 break-all">{selectedLog.recipient}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loại Email</p>
                  <p className="font-bold text-slate-800 text-xs mt-1">
                    {TYPE_LABEL_MAP[selectedLog.type]?.label || selectedLog.type}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Thời gian tạo</p>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {new Date(selectedLog.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Thời gian gửi</p>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {selectedLog.sentAt ? new Date(selectedLog.sentAt).toLocaleString('vi-VN') : 'Chưa gửi'}
                  </p>
                </div>
              </div>

              {/* Error Message if Failed */}
              {selectedLog.errorMessage && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-1">
                  <p className="text-rose-700 font-bold text-xs flex items-center gap-1.5">
                    <span>⚠️</span> Chi tiết lỗi:
                  </p>
                  <p className="text-rose-900 font-mono text-[11px] break-all bg-rose-100/50 p-2 rounded-lg">
                    {selectedLog.errorMessage}
                  </p>
                </div>
              )}

              {/* Metadata JSON display if available */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Metadata JSON Payload</p>
                  <pre className="bg-slate-900 text-slate-200 font-mono text-[11px] p-4 rounded-2xl overflow-x-auto max-h-48">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <button
                onClick={() => handleResend(selectedLog.id)}
                disabled={resendingId === selectedLog.id}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resendingId === selectedLog.id ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Đang gửi lại...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Gửi lại Email này</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
