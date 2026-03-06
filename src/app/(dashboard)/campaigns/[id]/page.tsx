// src/app/(dashboard)/campaigns/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Pause, ArrowLeft } from 'lucide-react';
import useSWR from 'swr';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CampaignMetrics } from '@/components/campaigns/CampaignMetrics';
import { LeadFunnel } from '@/components/campaigns/LeadFunnel';
import { LeadTable } from '@/components/leads/LeadTable';
import { useToast } from '@/contexts/toast-context';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TABS = ['Overview', 'Leads', 'Executions'];

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const [tab, setTab] = useState('Overview');
  const { data, isLoading, mutate } = useSWR(`/api/campaigns/${id}`, fetcher);

  const campaign = data?.campaign;

  const handleToggle = async () => {
    if (!campaign) return;
    const action = campaign.status === 'active' ? 'pause' : 'launch';
    try {
      await fetch(`/api/campaigns/${id}/${action}`, { method: 'POST' });
      addToast(action === 'pause' ? 'Campaign paused' : 'Campaign launched!', 'success');
      mutate();
    } catch {
      addToast('Action failed', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton variant="text" count={2} />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Campaign not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/campaigns')}>Go Back</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={campaign.name}
        subtitle={`Created ${new Date(campaign.createdAt).toLocaleDateString()}`}
      >
        <Badge status={campaign.status} size="md" dot>{campaign.status}</Badge>
        {(campaign.status === 'active' || campaign.status === 'draft' || campaign.status === 'paused') && (
          <Button
            variant={campaign.status === 'active' ? 'secondary' : 'primary'}
            icon={campaign.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
            onClick={handleToggle}
          >
            {campaign.status === 'active' ? 'Pause' : 'Launch'}
          </Button>
        )}
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px',
                tab === t ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CampaignMetrics campaignId={id} />
            <LeadFunnel campaignId={id} />

            {/* Stats summary */}
            <div className="col-span-full grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {[
                { label: 'Total Leads', value: campaign.stats?.totalLeads || 0 },
                { label: 'Contacted', value: campaign.stats?.contacted || 0 },
                { label: 'Opened', value: campaign.stats?.opened || 0 },
                { label: 'Clicked', value: campaign.stats?.clicked || 0 },
                { label: 'Replied', value: campaign.stats?.replied || 0 },
                { label: 'Bounced', value: campaign.stats?.bounced || 0 },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-white/2 p-3 text-center">
                  <p className="text-lg font-bold font-mono text-foreground">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Leads' && (
          <LeadTable campaignId={id} />
        )}

        {tab === 'Executions' && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Execution logs will appear here when the campaign is running.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
