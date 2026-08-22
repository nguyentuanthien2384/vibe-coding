'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Package,
  ShoppingCart,
  UserPlus,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Check,
  ExternalLink,
} from 'lucide-react';
import NotificationBell from '../../../components/ui/notification-bell';
import NotificationBadge from '../../../components/ui/notification-badge';
import { useAdminNotifications } from '../hooks/use-admin-notifications';
import {
  AdminNotification,
  AdminNotificationType,
} from '../../../types/notification.types';

const typeIconMap: Record<AdminNotificationType, { icon: ReactNode; bgClass: string }> = {
  NEW_ORDER: {
    icon: <ShoppingCart className="w-4 h-4 text-orange-600" />,
    bgClass: 'bg-orange-100',
  },
  NEW_CUSTOMER: {
    icon: <UserPlus className="w-4 h-4 text-blue-600" />,
    bgClass: 'bg-blue-100',
  },
  PAYMENT_SUBMITTED: {
    icon: <CreditCard className="w-4 h-4 text-amber-600" />,
    bgClass: 'bg-amber-100',
  },
  PAYMENT_CONFIRMED: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    bgClass: 'bg-emerald-100',
  },
  ORDER_STATUS_CHANGED: {
    icon: <Package className="w-4 h-4 text-purple-600" />,
    bgClass: 'bg-purple-100',
  },
  SYSTEM_ALERT: {
    icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
    bgClass: 'bg-rose-100',
  },
  ORDER: {
    icon: <ShoppingCart className="w-4 h-4 text-orange-600" />,
    bgClass: 'bg-orange-100',
  },
  STOCK: {
    icon: <Package className="w-4 h-4 text-yellow-600" />,
    bgClass: 'bg-yellow-100',
  },
  SYSTEM: {
    icon: <AlertTriangle className="w-4 h-4 text-blue-600" />,
    bgClass: 'bg-blue-100',
  },
};

const formatRelativeTime = (isoString: string) => {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    return `${Math.floor(hrs / 24)} ngày trước`;
  } catch {
    return 'Vừa xong';
  }
};

const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useAdminNotifications();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: AdminNotification) => {
    if (!notif.isRead) {
      void markAsRead(notif.id);
    }
    if (notif.actionUrl) {
      setIsOpen(false);
      router.push(notif.actionUrl);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <NotificationBell
        unreadCount={unreadCount}
        onClick={() => setIsOpen((o) => !o)}
      />

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-88 md:w-96 bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-[#E0E0E0] z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#4880FF]" />
              <span className="font-bold text-sm text-slate-800">
                Thông báo hệ thống
              </span>
              {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="text-xs text-[#4880FF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <li className="py-10 px-4 text-center text-slate-400 text-xs font-semibold">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#4880FF] border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải thông báo...</span>
                  </div>
                ) : (
                  <>
                    <Bell className="mx-auto h-8 w-8 mb-2 opacity-30 text-slate-400" />
                    <span>Chưa có thông báo nào.</span>
                  </>
                )}
              </li>
            ) : (
              notifications.map((notif) => {
                const typeConfig = typeIconMap[notif.type] || {
                  icon: <Bell className="w-4 h-4 text-slate-600" />,
                  bgClass: 'bg-slate-100',
                };

                const messageText = notif.content || notif.message || '';

                return (
                  <li
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex gap-3.5 px-4 py-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      !notif.isRead ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Icon Bubble */}
                    <div
                      className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-xl ${typeConfig.bgClass} flex items-center justify-center shadow-xs`}
                    >
                      {typeConfig.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#4880FF]" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {messageText}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                        {notif.actionUrl && (
                          <span className="text-[11px] font-bold text-[#4880FF] hover:underline flex items-center gap-0.5">
                            Xem <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/orders');
              }}
              className="text-xs text-[#4880FF] hover:underline font-bold"
            >
              Xem đơn hàng →
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/customers');
              }}
              className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
            >
              Khách hàng →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
