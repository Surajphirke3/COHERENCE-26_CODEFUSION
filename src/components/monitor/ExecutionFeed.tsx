// src/components/monitor/ExecutionFeed.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';

interface ExecutionEvent {
  id: string;
  timestamp: string;
  leadName: string;
  action: string;
  status: 'success' | 'failed' | 'pending';
}

export function ExecutionFeed({ campaignId }: { campaignId: string }) {
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource(`/api/campaigns/${campaignId}/metrics`);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event) {
          setEvents((prev) => [...prev.slice(-49), { ...data.event, id: Date.now().toString() }]);
        }
      } catch { /* ignore */ }
    };
    return () => es.close();
  }, [campaignId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [events]);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'success') return <CheckCircle size={14} className="text-success" />;
    if (status === 'failed') return <XCircle size={14} className="text-danger" />;
    return <Loader2 size={14} className="text-warning animate-spin" />;
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Mail size={14} className="text-accent" /> Execution Feed
        </h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {events.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted-foreground">Waiting for events…</p>
        ) : (
          events.map((e) => (
            <div key={e.id} className="flex items-start gap-2 rounded-lg bg-white/2 px-3 py-2 text-xs animate-slide-up">
              <StatusIcon status={e.status} />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground">{e.leadName}</span>
                <span className="text-muted-foreground"> — {e.action}</span>
              </div>
              <span className="shrink-0 text-muted-foreground font-mono text-[10px]">
                {new Date(e.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
