// src/app/(dashboard)/workflows/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GitBranch, Search, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkflows } from '@/lib/hooks/useWorkflows';
import { formatDate } from '@/lib/utils';

export default function WorkflowsPage() {
  const [search, setSearch] = useState('');
  const { workflows, total, isLoading } = useWorkflows({ search: search || undefined });

  return (
    <div>
      <PageHeader title="Workflows" subtitle={`${total} workflows`}>
        <Link href="/workflows/templates">
          <Button icon={<Plus size={16} />}>New Workflow</Button>
        </Link>
      </PageHeader>

      <div className="p-6 space-y-5">
        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search workflows…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-border bg-card pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent w-64"
            />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-40" />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted text-accent">
              <GitBranch size={28} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No workflows yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first workflow to automate outreach</p>
            <div className="mt-5">
              <Link href="/workflows/templates">
                <Button icon={<Plus size={16} />}>Browse Templates</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workflows.map((w: { _id: string; name: string; description?: string; graph?: { nodes?: unknown[] }; version: number; isTemplate: boolean; createdAt: string }) => (
              <Link key={w._id} href={`/workflows/${w._id}`}>
                <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-border-hover hover:-translate-y-px hover:shadow-lg hover:shadow-accent/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted text-accent">
                      <GitBranch size={18} />
                    </div>
                    {w.isTemplate && <Badge size="sm" status="completed">Template</Badge>}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground truncate">{w.name}</h3>
                  {w.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{w.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{w.graph?.nodes?.length || 0} nodes</span>
                    <span>v{w.version}</span>
                    <span className="ml-auto">{formatDate(w.createdAt, 'short')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
