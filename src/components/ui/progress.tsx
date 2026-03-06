// src/components/ui/progress.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number; // 0-100
  variant?: 'accent' | 'success' | 'warning' | 'danger' | 'ai';
  className?: string;
  showLabel?: boolean;
}

const barColors: Record<string, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  ai: 'bg-ai',
};

export function Progress({ value, variant = 'accent', className, showLabel }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/6">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', barColors[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-mono text-muted-foreground">{Math.round(clamped)}%</span>
      )}
    </div>
  );
}
