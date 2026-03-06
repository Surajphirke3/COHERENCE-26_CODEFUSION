// src/components/ui/skeleton.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
  variant?: 'text' | 'card' | 'table-row' | 'circle';
  className?: string;
  count?: number;
}

const base = 'bg-linear-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%] animate-shimmer rounded';

export function Skeleton({ variant = 'text', className, count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'circle') {
    return (
      <div className="flex gap-2">
        {items.map((_, i) => (
          <div key={i} className={cn(base, 'h-10 w-10 rounded-full', className)} />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="flex flex-col gap-4">
        {items.map((_, i) => (
          <div key={i} className={cn(base, 'h-32 w-full rounded-xl', className)} />
        ))}
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className="flex flex-col gap-2">
        {items.map((_, i) => (
          <div key={i} className={cn(base, 'h-12 w-full rounded-lg', className)} />
        ))}
      </div>
    );
  }

  // text
  return (
    <div className="flex flex-col gap-2">
      {items.map((_, i) => (
        <div key={i} className={cn(base, 'h-4 rounded', i === count - 1 ? 'w-3/4' : 'w-full', className)} />
      ))}
    </div>
  );
}
