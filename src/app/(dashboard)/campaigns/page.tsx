// src/app/(dashboard)/campaigns/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { useCampaigns } from '@/lib/hooks/useCampaigns';
import { useCampaignStore } from '@/lib/store/campaignStore';
import { cn } from '@/lib/utils';

const TABS = ['all', 'active', 'paused', 'draft', 'completed'];

export default function CampaignsPage() {
  const { statusFilter, setStatusFilter } = useCampaignStore();
  const { campaigns, isLoading, mutate } = useCampaigns({ status: statusFilter });

  return (
    <div>
      <PageHeader title="Campaigns" subtitle="Manage your outreach campaigns">
        <Link href="/campaigns?new=true">
          <Button icon={<Plus size={16} />}>New Campaign</Button>
        </Link>
      </PageHeader>

      <div className="p-6 space-y-5">
        {/* Tab filters */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-white/[0.02] p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all duration-150 cursor-pointer',
                statusFilter === tab
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Campaign grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-52" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted text-accent">
              <Plus size={28} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No campaigns yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first campaign to start outreach</p>
            <Link href="/campaigns?new=true" className="mt-4">
              <Button>Create Campaign</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((c: { _id: string; name: string; status: string; stats?: Record<string, number> }) => (
              <CampaignCard key={c._id} campaign={c as any} onMutate={mutate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
