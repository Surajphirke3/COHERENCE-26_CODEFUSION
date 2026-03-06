// src/components/ai/ObjectionHandlerPanel.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/contexts/toast-context';

interface ObjectionHandlerPanelProps {
  replyText: string;
  leadId: string;
}

interface ResponseOption {
  label: string;
  body: string;
}

export function ObjectionHandlerPanel({ replyText, leadId }: ObjectionHandlerPanelProps) {
  const { addToast } = useToast();
  const [options, setOptions] = useState<ResponseOption[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setOptions([]);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `The lead replied with: "${replyText}". Suggest 3 response options in JSON format: [{"label":"short label","body":"full response text"}]. Consider the lead's sentiment and provide: 1) Address concern directly, 2) Offer demo/meeting, 3) Send relevant case study.`,
          leadId,
        }),
      });

      if (!res.ok) throw new Error();

      const reader = res.body?.getReader();
      if (!reader) throw new Error();

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      try {
        const parsed = JSON.parse(accumulated);
        setOptions(Array.isArray(parsed) ? parsed : []);
      } catch {
        // Fallback
        setOptions([
          { label: 'Address concern', body: 'Thank you for your feedback. I understand your concern and...' },
          { label: 'Offer demo', body: 'I\'d love to show you how we can specifically help with...' },
          { label: 'Send case study', body: 'I have a case study from a similar company that...' },
        ]);
      }
    } catch {
      addToast('Failed to generate responses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (replyText) generate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const copyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied!', 'success');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare size={14} className="text-ai" /> Suggested Responses
        </h4>
        <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={generate} loading={loading}>
          Regenerate
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {options.map((opt, i) => (
            <div key={i} className="rounded-lg border border-border bg-white/2 p-4 hover:border-border-hover transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-ai">{opt.label}</span>
                <button
                  onClick={() => copyResponse(opt.body)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Copy response"
                >
                  <Copy size={12} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{opt.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
