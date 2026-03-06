// src/app/(dashboard)/leads/[id]/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Building2, Briefcase, Globe, Sparkles } from 'lucide-react';
import useSWR from 'swr';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadTimeline } from '@/components/leads/LeadTimeline';
import { AIPreviewPanel } from '@/components/ai/AIPreviewPanel';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const stageStatusMap: Record<string, 'active' | 'paused' | 'draft' | 'completed' | 'failed' | 'replied' | 'default'> = {
  imported: 'draft', pending: 'paused', contacted: 'active', opened: 'active',
  clicked: 'completed', replied: 'replied', interested: 'replied', converted: 'completed',
  unsubscribed: 'failed', bounced: 'failed',
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useSWR(`/api/leads/${id}`, fetcher);

  const lead = data?.lead;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton variant="text" count={3} />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Lead not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/leads')}>Go Back</Button>
      </div>
    );
  }

  const scoreColor = lead.score >= 70 ? 'success' : lead.score >= 40 ? 'warning' : 'danger';
  const scoreLabel = lead.score >= 70 ? 'Hot' : lead.score >= 40 ? 'Warm' : 'Cold';

  return (
    <div>
      <PageHeader
        title={lead.name}
        subtitle={[lead.company, lead.role].filter(Boolean).join(' · ')}
      >
        <Badge status={stageStatusMap[lead.stage] || 'default'} size="md" dot>{lead.stage}</Badge>
        <Badge status={scoreColor === 'success' ? 'active' : scoreColor === 'warning' ? 'paused' : 'failed'} size="md">
          {scoreLabel} ({lead.score})
        </Badge>
        <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => router.push('/leads')}>
          Back
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {/* Left: Contact info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>

            <InfoRow icon={Mail} label="Email" value={lead.email} />
            {lead.company && <InfoRow icon={Building2} label="Company" value={lead.company} />}
            {lead.role && <InfoRow icon={Briefcase} label="Role" value={lead.role} />}
            {lead.website && <InfoRow icon={Globe} label="Website" value={lead.website} />}
            {lead.industry && <InfoRow icon={Briefcase} label="Industry" value={lead.industry} />}

            {/* Score bar */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Lead Score</p>
              <Progress value={lead.score} variant={scoreColor as 'success' | 'warning' | 'danger'} showLabel />
            </div>

            {/* Tags */}
            {lead.tags?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {lead.tags.map((tag: string) => (
                    <Badge key={tag} size="sm">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {lead.painPoint && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pain Point</p>
                <p className="text-sm text-foreground">{lead.painPoint}</p>
              </div>
            )}
          </div>

          {/* AI Preview */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-ai" /> AI Message Preview
            </h3>
            <AIPreviewPanel leadId={id} leadName={lead.name} />
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Activity Timeline</h3>
          <LeadTimeline leadId={id} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/4 text-muted-foreground">
        <Icon size={14} />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}
