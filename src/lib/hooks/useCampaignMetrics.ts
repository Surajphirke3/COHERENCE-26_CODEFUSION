// src/lib/hooks/useCampaignMetrics.ts
'use client';

import useSWR from 'swr';
import { useEffect, useState, useRef } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useCampaignMetrics(campaignId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    campaignId ? `/api/campaigns/${campaignId}/metrics` : null,
    fetcher
  );

  const [isLive, setIsLive] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    const es = new EventSource(`/api/campaigns/${campaignId}/metrics`);
    esRef.current = es;

    es.onopen = () => setIsLive(true);
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        mutate(parsed, false);
      } catch {
        // ignore parse errors
      }
    };
    es.onerror = () => {
      setIsLive(false);
      es.close();
    };

    return () => {
      es.close();
      setIsLive(false);
    };
  }, [campaignId, mutate]);

  return {
    metrics: data?.metrics || data || null,
    isLoading,
    isLive,
    error,
  };
}
