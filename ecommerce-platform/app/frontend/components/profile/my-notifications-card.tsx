"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  EmailLog,
  EmailType,
  EmailLogQueryDto,
  EmailLogsPagination,
} from '@/types/email-log.types';
import { getMyNotificationsApi } from '@/lib/email-log';
import { useAuthStore } from '@/store/use-auth-store';

const TYPE_MAP: Record<EmailType, { title: string; icon: string; bg: string; text: string }> = {
  REGISTER_WELCOME: {
    title: 'Đăng ký tài khoản',
    icon: '🎉',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
  },
  ORDER_CONFIRMATION: {
    title: 'Xác nhận đơn hàng',
    icon: '📦',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
  },
  PASSWORD_CHANGED: {
    title: 'Đổi mật khẩu',
    icon: '🔑',
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
  },
  SECURITY_ALERT: {
    title: 'Cảnh báo bảo mật',
    icon: '🛡️',
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-700',
  },
};

export const MyNotificationsCard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const [notifications, setNotifications] = useState<EmailLog[]>([]);
  const [pagination, setPagination] = useState<EmailLogsPagination>({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<EmailType | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState<EmailLog | null>(null);

  const fetchMyNotifications = useCallback(
    async (page = currentPage, type = selectedType) => {
      try {
        setIsLoading(true);
        setError(null);

        const params: EmailLogQueryDto = {
          page,
          limit: 8,
          type: type || undefined,
        };

        const res = await getMyNotificationsApi(params);
        setNotifications(res.items || []);
        if (res.pagination) {
          setPagination(res.pagination);
          setCurrentPage(res.pagination.page);
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Không thể tải danh sách thông báo của bạn';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, selectedType]
  );

  useEffect(() => {
    fetchMyNotifications(1, selectedType);
  }, [selectedType]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6 animate-fadeIn">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Thông báo của tôi 🔔
            </h2>
            <span className="bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {pagination.total} thông báo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách email thông báo đã được hệ thống gửi tới địa chỉ{' '}
            <strong className="text-slate-700">{user?.email}</strong>
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedType('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedType === ''
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setSelectedType('ORDER_CONFIRMATION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedType === 'ORDER_CONFIRMATION'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📦 Đơn hàng
          </button>
          <button
            onClick={() => setSelectedType('REGISTER_WELCOME')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedType === 'REGISTER_WELCOME'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🎉 Đăng ký
          </button>
          <button
            onClick={() => setSelectedType('SECURITY_ALERT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedType === 'SECURITY_ALERT'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🛡️ Bảo mật
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-xs text-rose-700 font-bold">{error}</p>
          <button
            onClick={() => fetchMyNotifications(1, selectedType)}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-20 bg-slate-100 rounded-2xl w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-12 text-center space-y-3 border border-dashed border-slate-200 rounded-2xl">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            📭
          </div>
          <h3 className="text-base font-bold text-slate-800">Không có thông báo nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bạn chưa nhận được thông báo email nào trùng khớp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const typeConfig = TYPE_MAP[item.type] || {
              title: item.type,
              icon: '✉️',
              bg: 'bg-slate-50 border-slate-200',
              text: 'text-slate-700',
            };

            const formattedDate = new Date(item.createdAt).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                onClick={() => setSelectedNotification(item)}
                className="p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/20 transition-all cursor-pointer flex items-start gap-4 group"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${typeConfig.bg}`}
                >
                  {typeConfig.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeConfig.bg} ${typeConfig.text}`}
                    >
                      {typeConfig.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formattedDate}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                    {item.subject}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    Gửi tới: <span className="font-semibold text-slate-700">{item.recipient}</span>
                  </p>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Hiển thị trang <strong className="text-slate-900">{pagination.page}</strong> /{' '}
                <strong className="text-slate-900">{pagination.totalPages}</strong> (Tổng{' '}
                <strong className="text-slate-900">{pagination.total}</strong> thông báo)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const prev = currentPage - 1;
                    setCurrentPage(prev);
                    fetchMyNotifications(prev, selectedType);
                  }}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                        fetchMyNotifications(pNum, selectedType);
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        pNum === currentPage
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    const next = currentPage + 1;
                    setCurrentPage(next);
                    fetchMyNotifications(next, selectedType);
                  }}
                  disabled={currentPage >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sau &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 relative">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                  Chi tiết thông báo
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                  {selectedNotification.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-slate-500">
                  <strong className="text-slate-700">Người nhận:</strong> {selectedNotification.recipient}
                </p>
                <p className="text-slate-500">
                  <strong className="text-slate-700">Thời gian gửi:</strong>{' '}
                  {new Date(selectedNotification.createdAt).toLocaleString('vi-VN')}
                </p>
                <p className="text-slate-500">
                  <strong className="text-slate-700">Trạng thái:</strong>{' '}
                  <span className="font-bold text-emerald-600">Đã phát thành công</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
