// src/app/(dashboard)/campaigns/[id]/monitor/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExecutionFeed } from '@/components/monitor/ExecutionFeed';
import { SafetyMeter } from '@/components/monitor/SafetyMeter';
import { useSafety } from '@/lib/hooks/useSafety';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';

export default function MonitorPage() {
  const { id } = useParams<{ id: string }>();
  const { alerts } = useSafety();

  return (
    <div>
      <PageHeader title="Campaign Monitor" subtitle="Live execution monitoring and safety controls" />

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {/* Left: Safety Meter */}
        <div className="space-y-4">
          <SafetyMeter />

          {/* Domain Health */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Shield size={14} className="text-success" /> Domain Health
            </h3>
            <div className="space-y-2">
              {['SPF', 'DKIM', 'DMARC'].map((check) => (
                <div key={check} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{check}</span>
                  <Badge status="active" size="sm">Pass</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Execution Feed */}
        <div className="h-[600px]">
          <ExecutionFeed campaignId={id} />
        </div>

        {/* Right: Alerts */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-warning" /> Safety Alerts
          </h3>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No active alerts</p>
            ) : (
              alerts.map((alert: { _id: string; type: string; message: string; severity: string; createdAt: string }) => (
                <div key={alert._id} className="rounded-lg border border-border bg-white/2 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={alert.severity === 'high' ? 'failed' : 'paused'} size="sm">{alert.severity}</Badge>
                    <span className="text-xs font-medium text-foreground">{alert.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
