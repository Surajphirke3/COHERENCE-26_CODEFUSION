// src/components/campaigns/LeadFunnel.tsx
'use client';

import React from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface LeadFunnelProps {
  campaignId?: string;
}

const STAGES = ['Imported', 'Contacted', 'Opened', 'Clicked', 'Replied', 'Converted'];
const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function LeadFunnel({ campaignId }: LeadFunnelProps) {
  const { funnelData, isLoading } = useAnalytics({ campaignId });

  if (isLoading) return <Skeleton variant="card" />;

  // Build funnel from funnelData or defaults
  const funnel = STAGES.map((stage, i) => {
    const match = funnelData.find((f: { stage: string }) => f.stage?.toLowerCase() === stage.toLowerCase());
    return {
      stage,
      count: match?.count || 0,
      color: COLORS[i],
    };
  });

  const maxCount = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Lead Funnel</h3>
      <div className="space-y-2">
        {funnel.map((item, i) => {
          const widthPct = Math.max((item.count / maxCount) * 100, 8);
          const prevCount = i > 0 ? funnel[i - 1].count : item.count;
          const convPct = prevCount > 0 ? ((item.count / prevCount) * 100).toFixed(1) : '—';

          return (
            <div key={item.stage} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-muted-foreground text-right">{item.stage}</span>
              <div className="flex-1 relative">
                <div
                  className="h-8 rounded-md flex items-center px-3 transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    background: `${item.color}25`,
                    borderLeft: `3px solid ${item.color}`,
                  }}
                >
                  <span className="text-xs font-mono font-medium text-foreground">{item.count}</span>
                </div>
              </div>
              <span className="w-12 shrink-0 text-xs text-muted-foreground font-mono text-right">
                {i > 0 ? `${convPct}%` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
