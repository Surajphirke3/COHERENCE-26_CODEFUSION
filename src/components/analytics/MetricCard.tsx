// src/components/analytics/MetricCard.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  className?: string;
}

export function MetricCard({ label, value, delta, deltaLabel, className }: MetricCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <div className={cn('rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-border-hover', className)}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-bold font-mono text-foreground">{value}</p>
      {delta !== undefined && (
        <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', isPositive ? 'text-success' : 'text-danger')}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{isPositive ? '+' : ''}{delta}%</span>
          {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}
