// src/app/(dashboard)/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Megaphone, Users, TrendingUp, Activity, Plus, Upload, ArrowRight, LayoutTemplate } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useCampaigns } from '@/lib/hooks/useCampaigns';
import { useLeads } from '@/lib/hooks/useLeads';
import { useActivity } from '@/lib/hooks/useActivity';
import { formatNumber, formatDate } from '@/lib/utils';

function KPICard({ icon: Icon, label, value, subtitle, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-border-hover hover:-translate-y-px">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(' ')[0] || 'there';

  const { campaigns, isLoading: campLoading } = useCampaigns({ limit: 5 });
  const { isLoading: leadsLoading } = useLeads({ limit: 1 });
  const { activities, isLoading: actLoading } = useActivity({ limit: 10 });

  const activeCampaigns = campaigns.filter((c: { status: string }) => c.status === 'active');
  const totalContacted = campaigns.reduce((sum: number, c: { stats?: { contacted?: number } }) => sum + (c.stats?.contacted || 0), 0);
  const totalReplied = campaigns.reduce((sum: number, c: { stats?: { replied?: number } }) => sum + (c.stats?.replied || 0), 0);
  const replyRate = totalContacted > 0 ? ((totalReplied / totalContacted) * 100).toFixed(1) : '0';

  if (campLoading || leadsLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" count={2} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton variant="card" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Good morning, ${userName} 👋`} subtitle="Welcome back — here's your outreach overview">
        <Link href="/campaigns?new=true">
          <Button icon={<Plus size={16} />}>New Campaign</Button>
        </Link>
        <Link href="/leads/import">
          <Button variant="secondary" icon={<Upload size={16} />}>Import Leads</Button>
        </Link>
        <Link href="/workflows/templates">
          <Button variant="secondary" icon={<LayoutTemplate size={16} />}>Browse Templates</Button>
        </Link>
      </PageHeader>

      <div className="space-y-6 p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard icon={Megaphone} label="Total Campaigns" value={campaigns.length} color="bg-accent-muted text-accent" />
          <KPICard icon={Users} label="Leads Contacted" value={formatNumber(totalContacted)} color="bg-success-muted text-success" />
          <KPICard icon={TrendingUp} label="Avg Reply Rate" value={`${replyRate}%`} color="bg-ai-muted text-ai" />
          <KPICard icon={Activity} label="Active Campaigns" value={activeCampaigns.length} color="bg-warning-muted text-warning" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Campaigns */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent Campaigns</h2>
              <Link href="/campaigns" className="text-xs text-accent hover:text-accent-hover transition-colors">
                View all <ArrowRight size={12} className="inline ml-0.5" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {campaigns.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No campaigns yet</p>
              ) : (
                campaigns.slice(0, 5).map((c: { _id: string; name: string; status: string; stats?: { totalLeads?: number; contacted?: number } }) => (
                  <Link key={c._id} href={`/campaigns/${c._id}`} className="flex items-center justify-between px-5 py-3 hover:bg-white/2 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <div className="mt-1 w-32">
                        <Progress value={c.stats?.totalLeads ? ((c.stats?.contacted || 0) / c.stats.totalLeads) * 100 : 0} variant="accent" />
                      </div>
                    </div>
                    <Badge status={c.status as 'active' | 'paused' | 'draft' | 'completed' | 'failed'} size="sm" dot>
                      {c.status}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            </div>
            <div className="divide-y divide-border">
              {actLoading ? (
                <div className="p-5"><Skeleton variant="text" count={5} /></div>
              ) : activities.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No activity yet</p>
              ) : (
                activities.slice(0, 10).map((a: { _id: string; action: string; resourceType: string; description?: string; createdAt: string }) => (
                  <div key={a._id} className="flex items-start gap-3 px-5 py-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent text-[10px] font-bold">
                      {a.resourceType?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{a.description || a.action}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.createdAt, 'short')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
