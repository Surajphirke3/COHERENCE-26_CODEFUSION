// src/app/(dashboard)/safety/page.tsx
'use client';

import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSafety } from '@/lib/hooks/useSafety';
import { useToast } from '@/contexts/toast-context';
import { SafetyConfigUpdateSchema, type SafetyConfigUpdateInput } from '@/lib/validators/safety.schema';

export default function SafetyPage() {
  const { health, config, alerts, isLoading, mutate, mutateAlerts } = useSafety();
  const { addToast } = useToast();

  const { register, handleSubmit, formState: { errors: formErrors, isSubmitting } } = useForm<SafetyConfigUpdateInput>({
    resolver: zodResolver(SafetyConfigUpdateSchema),
    values: config || undefined,
  });

  const onSubmit = async (data: SafetyConfigUpdateInput) => {
    try {
      const res = await fetch('/api/safety', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      addToast('Safety config updated', 'success');
      mutate();
    } catch {
      addToast('Failed to update config', 'error');
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await fetch(`/api/safety/alerts/${alertId}/resolve`, { method: 'POST' });
      addToast('Alert resolved', 'success');
      mutateAlerts();
    } catch {
      addToast('Failed to resolve alert', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton variant="text" count={2} />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Safety" subtitle="Email delivery health and safety controls" />

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        {/* Domain Health */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
            <Shield size={16} className="text-success" /> Domain Health
          </h3>

          {/* Score circle */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="8"
                  strokeDasharray={`${(health?.score || 0) * 2.64} 264`}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute text-xl font-bold font-mono text-foreground">{health?.score || 0}</span>
            </div>
            <div className="space-y-2">
              {['SPF', 'DKIM', 'DMARC'].map((check) => (
                <div key={check} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-success" />
                  <span className="text-sm text-foreground">{check}</span>
                  <Badge status="active" size="sm">Pass</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
            <AlertTriangle size={16} className="text-warning" /> Active Alerts
            {alerts.length > 0 && (
              <Badge status="failed" size="sm">{alerts.length}</Badge>
            )}
          </h3>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No active alerts — all clear!</p>
            ) : (
              alerts.map((alert: { _id: string; type: string; message: string; severity: string; createdAt: string }) => (
                <div key={alert._id} className="flex items-start gap-3 rounded-lg border border-border bg-white/[0.02] p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge status={alert.severity === 'high' ? 'failed' : 'paused'} size="sm">{alert.severity}</Badge>
                      <span className="text-xs font-medium text-foreground">{alert.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleResolve(alert._id)}>Resolve</Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Config form */}
        <div className="col-span-full rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-5">Safety Configuration</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Daily Send Limit"
              type="number"
              {...register('dailyLimit', { valueAsNumber: true })}
              error={formErrors.dailyLimit?.message}
            />
            <Input
              label="Time Window Start (hour)"
              type="number"
              {...register('timeWindowStart', { valueAsNumber: true })}
              error={formErrors.timeWindowStart?.message}
            />
            <Input
              label="Time Window End (hour)"
              type="number"
              {...register('timeWindowEnd', { valueAsNumber: true })}
              error={formErrors.timeWindowEnd?.message}
            />
            <Input
              label="Min Delay (ms)"
              type="number"
              {...register('minDelayMs', { valueAsNumber: true })}
              error={formErrors.minDelayMs?.message}
            />
            <Input
              label="Max Delay (ms)"
              type="number"
              {...register('maxDelayMs', { valueAsNumber: true })}
              error={formErrors.maxDelayMs?.message}
            />
            <Input
              label="Pause on Bounce Rate (0-1)"
              type="number"
              step="0.01"
              {...register('pauseOnBounceRate', { valueAsNumber: true })}
              error={formErrors.pauseOnBounceRate?.message}
            />
            <div className="col-span-full">
              <Button type="submit" loading={isSubmitting}>Save Configuration</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
