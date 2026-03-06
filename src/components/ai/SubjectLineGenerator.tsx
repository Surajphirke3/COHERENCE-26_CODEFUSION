// src/components/ai/SubjectLineGenerator.tsx
'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/contexts/toast-context';
import { cn } from '@/lib/utils';

interface SubjectLineGeneratorProps {
  onSelect: (subject: string) => void;
  leadId?: string;
  nodePrompt?: string;
}

export function SubjectLineGenerator({ onSelect, leadId, nodePrompt }: SubjectLineGeneratorProps) {
  const { addToast } = useToast();
  const [variants, setVariants] = useState<string[]>([]);
  const [selected, setSelected] = useState<number>(-1);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setVariants([]);
    setSelected(-1);

    try {
      const res = await fetch('/api/ai/personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          nodePrompt,
          generateVariantsOnly: true,
          count: 3,
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setVariants(data.variants || ['Variant 1', 'Variant 2', 'Variant 3']);
    } catch {
      addToast('Failed to generate variants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyVariant = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied!', 'success');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="ai" size="sm" icon={<Sparkles size={14} />} loading={loading} onClick={generate}>
          Generate Subject Variants
        </Button>
        {variants.length > 0 && (
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={generate}>
            Regenerate
          </Button>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
      )}

      {variants.length > 0 && !loading && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {variants.map((v, i) => (
            <button
              key={i}
              onClick={() => { setSelected(i); onSelect(v); }}
              className={cn(
                'group relative rounded-lg border p-3 text-left transition-all cursor-pointer',
                selected === i
                  ? 'border-accent bg-accent-muted/30'
                  : 'border-border bg-white/[0.02] hover:border-border-hover'
              )}
            >
              <p className="text-sm text-foreground pr-6">{v}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={cn(
                  'text-[10px] font-mono',
                  v.length >= 40 && v.length <= 60 ? 'text-success' : 'text-warning'
                )}>
                  {v.length} chars
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); copyVariant(v); }}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Copy"
                >
                  <Copy size={12} />
                </button>
              </div>
              {selected === i && (
                <div className="absolute right-2 top-2">
                  <Check size={14} className="text-accent" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
