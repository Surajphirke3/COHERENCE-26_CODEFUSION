// src/components/ai/StreamingMessage.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StreamingMessageProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export function StreamingMessage({ content, isStreaming, className }: StreamingMessageProps) {
  return (
    <div className={cn('relative whitespace-pre-wrap text-sm text-foreground leading-relaxed', className)}>
      {content || (isStreaming ? '' : 'No content')}
      {isStreaming && (
        <span className="inline-block h-4 w-0.5 ml-0.5 bg-accent animate-pulse" />
      )}
    </div>
  );
}
