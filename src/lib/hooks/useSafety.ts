// src/lib/hooks/useSafety.ts
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSafety() {
  const { data, error, isLoading, mutate } = useSWR('/api/safety', fetcher, {
    refreshInterval: 30000,
  });

  const alertsResult = useSWR('/api/safety/alerts', fetcher, { refreshInterval: 30000 });

  return {
    health: data?.health || null,
    config: data?.config || null,
    alerts: alertsResult.data?.alerts || [],
    isLoading: isLoading || alertsResult.isLoading,
    error: error || alertsResult.error,
    mutate,
    mutateAlerts: alertsResult.mutate,
  };
}
