// src/components/campaigns/CampaignMetrics.tsx
'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface CampaignMetricsProps {
  campaignId?: string;
}

export function CampaignMetrics({ campaignId }: CampaignMetricsProps) {
  const { dailyStats, isLoading } = useAnalytics({ campaignId });

  if (isLoading) return <Skeleton variant="card" />;

  const data = dailyStats.length > 0 ? dailyStats : generatePlaceholder();

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Outreach Activity (14 Days)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorReplied" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#e2e8f0',
            }}
          />
          <Area type="monotone" dataKey="sends" stroke="#3b82f6" fill="url(#colorSent)" strokeWidth={2} name="Sent" />
          <Area type="monotone" dataKey="opens" stroke="#10b981" fill="url(#colorOpened)" strokeWidth={2} name="Opened" />
          <Area type="monotone" dataKey="clicks" stroke="#06b6d4" fill="url(#colorClicked)" strokeWidth={2} name="Clicked" />
          <Area type="monotone" dataKey="replies" stroke="#8b5cf6" fill="url(#colorReplied)" strokeWidth={2} name="Replied" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function generatePlaceholder() {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      sends: 0, opens: 0, clicks: 0, replies: 0, bounces: 0,
    });
  }
  return days;
}
