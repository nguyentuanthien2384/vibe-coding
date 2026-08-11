'use client';

import { useState, useRef, useEffect } from 'react';
import { AdminNotification } from '../../../types/notification.types';
import NotificationBell from '../../../components/ui/notification-bell';
import NotificationBadge from '../../../components/ui/notification-badge';
import { Bell, Package, ShoppingCart, Monitor, Check } from 'lucide-react';

const MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: '1',
    title: 'Đơn hàng mới',
    message: 'Đơn hàng #DH-2024-001 vừa được đặt thành công.',
    type: 'ORDER',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
    actionUrl: '/dashboard/orders/1',
  },
  {
    id: '2',
    title: 'Sắp hết hàng',
    message: 'Sản phẩm "Áo thun basic" chỉ còn 3 sản phẩm.',
    type: 'STOCK',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false,
    actionUrl: '/dashboard/products/2',
  },
  {
    id: '3',
    title: 'Hệ thống',
    message: 'Sao lưu dữ liệu hàng ngày hoàn thành.',
    type: 'SYSTEM',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

const typeIconMap = {
  ORDER: <ShoppingCart className="w-4 h-4 text-orange-500" />,
  STOCK: <Package className="w-4 h-4 text-yellow-500" />,
  SYSTEM: <Monitor className="w-4 h-4 text-blue-500" />,
};

const formatRelativeTime = (isoString: string) => {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
};

const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <NotificationBell unreadCount={unreadCount} onClick={() => setIsOpen((o) => !o)} />

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-sm text-slate-700">Thông báo</span>
              {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Đọc tất cả
              </button>
            )}
          </div>

          <ul className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                  !notif.isRead ? 'bg-orange-50/40' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                  {typeIconMap[notif.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800 truncate">{notif.title}</p>
                    {!notif.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-4 py-2.5 border-t border-slate-100 text-center">
            <button className="text-xs text-orange-500 hover:text-orange-600 font-medium">
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
