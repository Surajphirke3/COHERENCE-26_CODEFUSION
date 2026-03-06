// src/components/ui/badge.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeStatus = 'active' | 'paused' | 'draft' | 'completed' | 'failed' | 'replied' | 'default';

export interface BadgeProps {
  children: React.ReactNode;
  status?: BadgeStatus;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const statusStyles: Record<BadgeStatus, string> = {
  active: 'bg-success-muted text-success border-success/20',
  paused: 'bg-warning-muted text-warning border-warning/20',
  draft: 'bg-white/[0.06] text-muted border-border',
  completed: 'bg-accent-muted text-accent border-accent/20',
  failed: 'bg-danger-muted text-danger border-danger/20',
  replied: 'bg-ai-muted text-ai border-ai/20',
  default: 'bg-white/[0.06] text-muted border-border',
};

const sizeStyles: Record<string, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
};

export function Badge({ children, status = 'default', size = 'md', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium capitalize leading-none',
        statusStyles[status],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-success': status === 'active',
            'bg-warning': status === 'paused',
            'bg-muted': status === 'draft' || status === 'default',
            'bg-accent': status === 'completed',
            'bg-danger': status === 'failed',
            'bg-ai': status === 'replied',
          })}
        />
      )}
      {children}
    </span>
  );
}
