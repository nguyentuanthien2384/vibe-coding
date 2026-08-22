'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getAdminNotificationsApi,
  markAllNotificationsAsReadApi,
  markNotificationAsReadApi,
} from '../api/notifications-api';
import { AdminNotification } from '../../../types/notification.types';

const POLL_INTERVAL_MS = 10_000;

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const prevUnreadCountRef = useRef<number>(0);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await getAdminNotificationsApi({ limit: 20 });
      setNotifications(data.items);
      setUnreadCount(data.unreadCount);
      setError(null);
      prevUnreadCountRef.current = data.unreadCount;
    } catch (err: unknown) {
      if (!silent) {
        setError(
          err instanceof Error ? err.message : 'Không thể tải thông báo',
        );
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Periodic polling & visibility re-fetch
  useEffect(() => {
    void fetchNotifications();

    const intervalId = window.setInterval(() => {
      void fetchNotifications(true);
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchNotifications(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id: number | string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await markNotificationAsReadApi(id);
      } catch (err) {
        // Rollback if needed
        void fetchNotifications(true);
      }
    },
    [fetchNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true })),
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsAsReadApi();
    } catch (err) {
      void fetchNotifications(true);
    }
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
