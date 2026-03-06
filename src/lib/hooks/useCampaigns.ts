// src/lib/hooks/useCampaigns.ts
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface UseCampaignsOptions {
  status?: string;
  page?: number;
  limit?: number;
}

export function useCampaigns(opts: UseCampaignsOptions = {}) {
  const params = new URLSearchParams();
  if (opts.status && opts.status !== 'all') params.set('status', opts.status);
  if (opts.page) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));

  const qs = params.toString();
  const key = `/api/campaigns${qs ? `?${qs}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher);

  return {
    campaigns: data?.campaigns || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  };
}
