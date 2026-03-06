// src/components/campaigns/CampaignCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { MoreHorizontal, Play, Pause, Copy, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/toast-context';
import { formatNumber } from '@/lib/utils';

interface CampaignCardProps {
  campaign: {
    _id: string;
    name: string;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
    stats?: {
      totalLeads?: number;
      contacted?: number;
      opened?: number;
      replied?: number;
    };
  };
  onMutate?: () => void;
}

export function CampaignCard({ campaign, onMutate }: CampaignCardProps) {
  const { addToast } = useToast();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const stats = campaign.stats || {};
  const total = stats.totalLeads || 0;
  const contacted = stats.contacted || 0;
  const pct = total > 0 ? (contacted / total) * 100 : 0;

  const handleAction = async (action: string) => {
    setMenuOpen(false);
    try {
      if (action === 'clone') {
        await fetch(`/api/campaigns/${campaign._id}/clone`, { method: 'POST' });
        addToast('Campaign cloned!', 'success');
      } else if (action === 'pause') {
        await fetch(`/api/campaigns/${campaign._id}/pause`, { method: 'POST' });
        addToast('Campaign paused', 'info');
      } else if (action === 'resume') {
        await fetch(`/api/campaigns/${campaign._id}/resume`, { method: 'POST' });
        addToast('Campaign resumed', 'success');
      } else if (action === 'delete') {
        await fetch(`/api/campaigns/${campaign._id}`, { method: 'DELETE' });
        addToast('Campaign deleted', 'info');
      }
      onMutate?.();
    } catch {
      addToast('Action failed', 'error');
    }
  };

  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-border-hover hover:-translate-y-px hover:shadow-lg hover:shadow-accent/5">
      {/* Status badge */}
      <div className="absolute right-4 top-4">
        <Badge status={campaign.status} size="sm" dot>{campaign.status}</Badge>
      </div>

      {/* Name */}
      <h3 className="text-base font-semibold text-foreground pr-20 truncate">{campaign.name}</h3>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progress</span>
          <span className="font-mono">{contacted} / {total}</span>
        </div>
        <Progress value={pct} variant="accent" />
      </div>

      {/* Mini stats */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span><span className="font-mono text-foreground">{formatNumber(contacted)}</span> sent</span>
        <span><span className="font-mono text-foreground">{formatNumber(stats.opened || 0)}</span> opened</span>
        <span><span className="font-mono text-foreground">{formatNumber(stats.replied || 0)}</span> replied</span>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-1.5">
        <Link href={`/campaigns/${campaign._id}/monitor`}>
          <Button size="sm" variant="secondary" icon={<Eye size={14} />}>Monitor</Button>
        </Link>
        {campaign.status === 'active' ? (
          <Button size="sm" variant="secondary" icon={<Pause size={14} />} onClick={() => handleAction('pause')}>Pause</Button>
        ) : campaign.status === 'paused' ? (
          <Button size="sm" variant="primary" icon={<Play size={14} />} onClick={() => handleAction('resume')}>Resume</Button>
        ) : null}

        {/* More menu */}
        <div className="relative ml-auto">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="More actions"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-border bg-card shadow-xl z-10 animate-scale-in">
              <button onClick={() => handleAction('clone')} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/4 cursor-pointer">
                <Copy size={14} /> Clone
              </button>
              <button onClick={() => handleAction('delete')} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-muted/50 cursor-pointer">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
