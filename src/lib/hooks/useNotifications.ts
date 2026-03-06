// src/lib/hooks/useNotifications.ts
'use client';

import useSWR from 'swr';
import { useCallback } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR('/api/notifications', fetcher, {
    refreshInterval: 30000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n: { read: boolean }) => !n.read).length;

  const markRead = useCallback(
    async (id: string) => {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      mutate();
    },
    [mutate]
  );

  const markAllRead = useCallback(async () => {
    await fetch('/api/notifications/read-all', { method: 'PATCH' });
    mutate();
  }, [mutate]);

  const dismiss = useCallback(
    async (id: string) => {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      mutate();
    },
    [mutate]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markRead,
    markAllRead,
    dismiss,
    mutate,
  };
}
