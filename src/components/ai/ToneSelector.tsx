// src/components/ai/ToneSelector.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const TONES = [
  { value: 'discovery', label: 'Discovery', tooltip: 'Exploratory questions, curiosity-driven' },
  { value: 'consultative', label: 'Consultative', tooltip: 'Expert advice, solution-oriented' },
  { value: 'formal', label: 'Formal', tooltip: 'Professional, structured communication' },
  { value: 'casual', label: 'Casual', tooltip: 'Friendly, conversational approach' },
  { value: 'urgency', label: 'Urgency', tooltip: 'Time-sensitive, action-oriented' },
];

interface ToneSelectorProps {
  value: string;
  onChange: (tone: string) => void;
}

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TONES.map((tone) => (
        <button
          key={tone.value}
          onClick={() => onChange(tone.value)}
          title={tone.tooltip}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer',
            value === tone.value
              ? 'border border-accent text-accent bg-accent-muted'
              : 'border border-border text-muted-foreground hover:text-foreground hover:border-border-hover'
          )}
        >
          {tone.label}
        </button>
      ))}
    </div>
  );
}
