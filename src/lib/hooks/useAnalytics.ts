// src/lib/hooks/useAnalytics.ts
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface UseAnalyticsOptions {
  campaignId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useAnalytics(opts: UseAnalyticsOptions = {}) {
  const params = new URLSearchParams();
  if (opts.campaignId) params.set('campaignId', opts.campaignId);
  if (opts.dateFrom) params.set('dateFrom', opts.dateFrom);
  if (opts.dateTo) params.set('dateTo', opts.dateTo);

  const qs = params.toString();
  const key = `/api/analytics${qs ? `?${qs}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher);

  return {
    funnelData: data?.funnelData || [],
    dailyStats: data?.dailyStats || [],
    topPerformingWorkflow: data?.topPerformingWorkflow || null,
    avgReplyRate: data?.avgReplyRate || 0,
    totalSent: data?.totalSent || 0,
    totalOpened: data?.totalOpened || 0,
    totalClicked: data?.totalClicked || 0,
    totalReplied: data?.totalReplied || 0,
    totalBounced: data?.totalBounced || 0,
    campaigns: data?.campaigns || [],
    isLoading,
    error,
    mutate,
  };
}
