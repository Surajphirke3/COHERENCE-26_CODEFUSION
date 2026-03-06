// src/app/(dashboard)/analytics/page.tsx
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/analytics/MetricCard';
import { CampaignMetrics } from '@/components/campaigns/CampaignMetrics';
import { LeadFunnel } from '@/components/campaigns/LeadFunnel';
import { Skeleton } from '@/components/ui/skeleton';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function AnalyticsPage() {
  const [campaignFilter, setCampaignFilter] = useState<string>('');
  const { totalSent, totalOpened, totalClicked, totalReplied, totalBounced, campaigns, isLoading } = useAnalytics({
    campaignId: campaignFilter || undefined,
  });

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';
  const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : '0';
  const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) : '0';

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Outreach performance insights across all campaigns">
        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground outline-none cursor-pointer"
        >
          <option value="">All Campaigns</option>
          {campaigns.map((c: { _id: string; name: string }) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </PageHeader>

      <div className="space-y-6 p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <MetricCard label="Total Sent" value={totalSent.toLocaleString()} />
            <MetricCard label="Open Rate" value={`${openRate}%`} />
            <MetricCard label="Click Rate" value={`${clickRate}%`} />
            <MetricCard label="Reply Rate" value={`${replyRate}%`} />
            <MetricCard label="Bounce Rate" value={`${bounceRate}%`} />
          </div>
        )}

        {/* Charts */}
        <CampaignMetrics campaignId={campaignFilter || undefined} />
        <LeadFunnel campaignId={campaignFilter || undefined} />

        {/* Campaign Comparison Table */}
        <div className="rounded-xl border border-border bg-card p-6 mt-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Campaign Comparison</h2>
          <Table
            data={campaigns}
            columns={[
              { key: 'name', header: 'Campaign Name', sortable: true },
              {
                key: 'status',
                header: 'Status',
                render: (row: any) => <Badge status={row.status} size="sm">{row.status}</Badge>,
              },
              {
                key: 'stats.contacted',
                header: 'Sent',
                render: (row: any) => row.stats?.contacted?.toLocaleString() || '0',
              },
              {
                key: 'openRate',
                header: 'Open Rate',
                render: (row: any) => {
                  const s = row.stats?.contacted || 0;
                  const o = row.stats?.opened || 0;
                  return s > 0 ? `${((o / s) * 100).toFixed(1)}%` : '0%';
                },
              },
              {
                key: 'replyRate',
                header: 'Reply Rate',
                render: (row: any) => {
                  const s = row.stats?.contacted || 0;
                  const r = row.stats?.replied || 0;
                  return s > 0 ? `${((r / s) * 100).toFixed(1)}%` : '0%';
                },
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
