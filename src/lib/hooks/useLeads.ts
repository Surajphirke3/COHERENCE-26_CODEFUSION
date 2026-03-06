// src/lib/hooks/useLeads.ts
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface UseLeadsOptions {
  campaignId?: string;
  stage?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useLeads(opts: UseLeadsOptions = {}) {
  const params = new URLSearchParams();
  if (opts.campaignId) params.set('campaignId', opts.campaignId);
  if (opts.stage && opts.stage !== 'all') params.set('stage', opts.stage);
  if (opts.search) params.set('search', opts.search);
  if (opts.page) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));

  const qs = params.toString();
  const key = `/api/leads${qs ? `?${qs}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher);

  return {
    leads: data?.leads || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  };
}
