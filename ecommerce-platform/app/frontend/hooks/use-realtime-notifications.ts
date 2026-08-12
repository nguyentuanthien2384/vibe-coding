'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { notificationsApi, InAppNotification } from '@/lib/notifications';

export function useRealtimeNotifications() {
  const { isAuthenticated, user } = useAuthStore();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. Fetch initial list & unread count
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await notificationsApi.getList(1, 10);
      setNotifications(res.data.items || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.warn('Lỗi tải danh sách thông báo:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 2. Setup SSE Listener for Real-time Push
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const sseUrl = `${backendUrl}/api/v1/notifications/sse`;

    let eventSource: EventSource | null = null;

    try {
      // Create EventSource connection with credentials
      eventSource = new EventSource(sseUrl, { withCredentials: true });

      eventSource.onmessage = (event) => {
        try {
          const newNotif: InAppNotification = JSON.parse(event.data);
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        } catch (err) {
          console.warn('Lỗi parse dữ liệu SSE notification:', err);
        }
      };

      eventSource.onerror = (err) => {
        // Suppress console error if SSE drops, EventSource auto-reconnects
        eventSource?.close();
      };
    } catch (err) {
      console.warn('Không thể mở kết nối SSE:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isAuthenticated, user?.id]);

  // 3. Action Handlers
  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Lỗi đánh dấu đã đọc:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Lỗi đánh dấu tất cả đã đọc:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
