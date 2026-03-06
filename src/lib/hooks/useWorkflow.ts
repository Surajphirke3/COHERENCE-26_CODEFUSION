// src/lib/hooks/useWorkflow.ts
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useWorkflow(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/workflows/${id}` : null,
    fetcher
  );

  return {
    workflow: data?.workflow || null,
    isLoading,
    error,
    mutate,
  };
}
