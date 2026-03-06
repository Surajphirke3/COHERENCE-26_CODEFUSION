// src/lib/hooks/useActivity.ts
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface UseActivityOptions {
  resourceType?: string;
  resourceId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export function useActivity(opts: UseActivityOptions = {}) {
  const params = new URLSearchParams();
  if (opts.resourceType) params.set('resourceType', opts.resourceType);
  if (opts.resourceId) params.set('resourceId', opts.resourceId);
  if (opts.userId) params.set('userId', opts.userId);
  if (opts.page) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));

  const qs = params.toString();
  const key = `/api/activity${qs ? `?${qs}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher);

  return {
    activities: data?.activities || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  };
}
