// src/components/leads/LeadTimeline.tsx
'use client';

import React from 'react';
import { Mail, Eye, Link2, MessageSquare, Tag } from 'lucide-react';
import { useActivity } from '@/lib/hooks/useActivity';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

interface LeadTimelineProps {
  leadId: string;
}

const iconMap: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  email_sent: { icon: Mail, color: 'text-accent', bg: 'bg-accent-muted' },
  email_opened: { icon: Eye, color: 'text-success', bg: 'bg-success-muted' },
  link_clicked: { icon: Link2, color: 'text-cyan-400', bg: 'bg-cyan-400/15' },
  email_replied: { icon: MessageSquare, color: 'text-ai', bg: 'bg-ai-muted' },
  stage_changed: { icon: Tag, color: 'text-muted-foreground', bg: 'bg-white/[0.06]' },
};

export function LeadTimeline({ leadId }: LeadTimelineProps) {
  const { activities, isLoading } = useActivity({
    resourceType: 'lead',
    resourceId: leadId,
  });

  if (isLoading) return <Skeleton variant="text" count={5} />;

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">No activity yet</div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

      {activities.map((a: { _id: string; action: string; description?: string; createdAt: string }) => {
        const config = iconMap[a.action] || iconMap.stage_changed;
        const Icon = config.icon;

        return (
          <div key={a._id} className="relative flex items-start gap-3 py-3 pl-2">
            <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.color}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-foreground">{a.description || a.action.replace(/_/g, ' ')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(a.createdAt, 'medium')}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
