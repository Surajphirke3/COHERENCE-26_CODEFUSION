// src/lib/hooks/useSafety.ts
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSafety() {
  const { data, error, isLoading, mutate } = useSWR('/api/safety', fetcher, {
    refreshInterval: 30000,
  });

  const alertsResult = useSWR('/api/safety/alerts', fetcher, { refreshInterval: 30000 });

  const health = data?.health ?? {
    score: data?.domainScore ?? 0,
    spf: data?.spf ?? false,
    dkim: data?.dkim ?? false,
    dmarc: data?.dmarc ?? false,
  };

  const config = data?.config ?? {
    dailyLimit: data?.dailyLimit ?? 80,
    todaySends: data?.todaySends ?? 0,
  };

  return {
    health,
    config,
    alerts: alertsResult.data?.alerts ?? data?.activeAlerts ?? [],
    isLoading: isLoading || alertsResult.isLoading,
    error: error || alertsResult.error,
    mutate,
    mutateAlerts: alertsResult.mutate,
  };
}
