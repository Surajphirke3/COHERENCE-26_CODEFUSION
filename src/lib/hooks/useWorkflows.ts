// src/lib/hooks/useWorkflows.ts
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface UseWorkflowsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export function useWorkflows(opts: UseWorkflowsOptions = {}) {
  const params = new URLSearchParams();
  if (opts.search) params.set('search', opts.search);
  if (opts.page) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));

  const qs = params.toString();
  const key = `/api/workflows${qs ? `?${qs}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher);

  return {
    workflows: data?.workflows || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  };
}
