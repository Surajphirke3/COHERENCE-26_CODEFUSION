// src/components/ai/AIPreviewPanel.tsx
'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StreamingMessage } from './StreamingMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/contexts/toast-context';

interface AIPreviewPanelProps {
  leadId: string;
  leadName: string;
}

export function AIPreviewPanel({ leadId, leadName }: AIPreviewPanelProps) {
  const { addToast } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setSubject('');
    setBody('');

    try {
      const res = await fetch('/api/ai/personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
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
        // Parse subject from first line
        const lines = accumulated.split('\n');
        if (lines.length > 0) {
          setSubject(lines[0].replace(/^Subject:\s*/i, ''));
          setBody(lines.slice(1).join('\n').trim());
        }
      }
    } catch {
      addToast('Failed to generate message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-3">
      <Button
        variant="ai"
        size="sm"
        icon={<Sparkles size={14} />}
        loading={loading}
        onClick={generate}
      >
        Generate for {leadName}
      </Button>

      {(subject || body || loading) && (
        <div className="space-y-3">
          {/* Subject */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-muted-foreground">Subject</label>
              <button
                onClick={() => handleCopy('subject', subject)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Copy subject"
              >
                {copiedField === 'subject' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              </button>
            </div>
            {loading && !subject ? (
              <Skeleton variant="text" />
            ) : (
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-border bg-white/2 px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent"
              />
            )}
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-muted-foreground">Body</label>
              <button
                onClick={() => handleCopy('body', body)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Copy body"
              >
                {copiedField === 'body' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              </button>
            </div>
            {loading && !body ? (
              <Skeleton variant="text" count={4} />
            ) : (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-border bg-white/2 px-3 py-2 text-sm text-foreground outline-none focus:border-accent resize-y"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
