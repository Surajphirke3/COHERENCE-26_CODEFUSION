'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { LayoutTemplate, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/contexts/toast-context';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  cold_outreach: 'Cold Outreach',
  follow_up: 'Follow Up',
  re_engagement: 'Re-Engagement',
  event_follow_up: 'Event Follow Up',
  investor_outreach: 'Investor Outreach',
};

type Template = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  usageCount?: number;
  graph?: { nodes?: unknown[]; edges?: unknown[] };
};

export default function WorkflowTemplatesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [category, setCategory] = useState('all');
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const query = useMemo(() => {
    if (category === 'all') return '/api/workflows/templates';
    return `/api/workflows/templates?category=${encodeURIComponent(category)}`;
  }, [category]);

  const { data, isLoading, mutate } = useSWR(query, fetcher);
  const templates: Template[] = data?.templates || [];

  const handleUseTemplate = async (templateId: string) => {
    setCreatingId(templateId);
    try {
      const res = await fetch('/api/workflows/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });
      if (!res.ok) throw new Error();
      const payload = await res.json();
      addToast('Workflow created from template', 'success');
      mutate();
      router.push(`/workflows/${payload.workflow._id}`);
    } catch {
      addToast('Failed to create workflow from template', 'error');
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Workflow Templates" subtitle="Start from proven outreach sequences">
        <Button variant="ai" icon={<Sparkles size={16} />} onClick={() => router.push('/workflows')}>
          My Workflows
        </Button>
      </PageHeader>

      <div className="space-y-5 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                category === value
                  ? 'border-accent bg-accent-muted text-accent'
                  : 'border-border bg-card text-muted-foreground hover:border-border-hover hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-52" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">No templates available for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <div key={template._id} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted text-accent">
                    <LayoutTemplate size={18} />
                  </div>
                  <Badge size="sm" status="active">{CATEGORY_LABELS[template.category] || template.category}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{template.description || 'No description'}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{template.graph?.nodes?.length || 0} nodes</span>
                  <span>{template.graph?.edges?.length || 0} edges</span>
                  <span className="ml-auto">Used {template.usageCount || 0}x</span>
                </div>
                {!!template.tags?.length && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {template.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Button
                    className="w-full"
                    loading={creatingId === template._id}
                    onClick={() => handleUseTemplate(template._id)}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
