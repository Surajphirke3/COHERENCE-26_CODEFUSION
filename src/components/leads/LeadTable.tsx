// src/components/leads/LeadTable.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads } from '@/lib/hooks/useLeads';
import { useLeadStore } from '@/lib/store/leadStore';
import { useToast } from '@/contexts/toast-context';
import { formatDate, cn } from '@/lib/utils';

interface LeadTableProps {
  campaignId?: string;
}

const stageStatusMap: Record<string, 'active' | 'paused' | 'draft' | 'completed' | 'failed' | 'replied' | 'default'> = {
  imported: 'draft',
  pending: 'paused',
  contacted: 'active',
  opened: 'active',
  clicked: 'completed',
  replied: 'replied',
  interested: 'replied',
  converted: 'completed',
  unsubscribed: 'failed',
  bounced: 'failed',
};

export function LeadTable({ campaignId }: LeadTableProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [stageFilter, setStageFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { leads, total, isLoading, mutate } = useLeads({
    campaignId,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    search: search || undefined,
    page,
    limit: 20,
  });

  const { selectedLeadIds, toggleLead, selectAll, clearSelection } = useLeadStore();
  const allSelected = leads.length > 0 && leads.every((l: { _id: string }) => selectedLeadIds.has(l._id));

  const handleSelectAll = () => {
    if (allSelected) clearSelection();
    else selectAll(leads.map((l: { _id: string }) => l._id));
  };

  const handleBulkDelete = async () => {
    try {
      await fetch('/api/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', leadIds: Array.from(selectedLeadIds) }),
      });
      addToast(`${selectedLeadIds.size} leads deleted`, 'success');
      clearSelection();
      mutate();
    } catch {
      addToast('Bulk action failed', 'error');
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = React.useMemo(() => {
    if (!sortKey) return leads;
    return [...leads].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null || bv == null) return 0;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [leads, sortKey, sortDir]);

  const scoreColor = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  if (isLoading) return <Skeleton variant="table-row" count={8} />;

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search leads…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent w-64"
        />
        <select
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground outline-none cursor-pointer"
        >
          <option value="all">All Stages</option>
          {['imported', 'contacted', 'opened', 'clicked', 'replied', 'converted', 'bounced'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selectedLeadIds.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-muted/30 px-4 py-2 animate-slide-up">
          <span className="text-sm text-foreground font-medium">{selectedLeadIds.size} selected</span>
          <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={handleBulkDelete}>Delete</Button>
          <Button size="sm" variant="secondary" onClick={clearSelection}>Clear</Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-white/2">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="rounded cursor-pointer accent-accent"
                />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">Name <ArrowUpDown size={12} /></div>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th
                className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => handleSort('stage')}
              >
                <div className="flex items-center gap-1">Stage <ArrowUpDown size={12} /></div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-1">Score <ArrowUpDown size={12} /></div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => handleSort('lastTouchedAt')}
              >
                <div className="flex items-center gap-1">Last Touch <ArrowUpDown size={12} /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">No leads found</td>
              </tr>
            ) : (
              sorted.map((lead: { _id: string; name: string; company?: string; email: string; stage: string; score: number; lastTouchedAt?: string }, idx: number) => (
                <tr
                  key={lead._id}
                  onClick={() => router.push(`/leads/${lead._id}`)}
                  className={cn(
                    'border-b border-border last:border-0 cursor-pointer transition-colors',
                    idx % 2 === 1 && 'bg-white/2',
                    'hover:bg-white/4',
                    selectedLeadIds.has(lead._id) && 'bg-accent-muted/20'
                  )}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.has(lead._id)}
                      onChange={() => toggleLead(lead._id)}
                      className="rounded cursor-pointer accent-accent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.email}</td>
                  <td className="px-4 py-3">
                    <Badge status={stageStatusMap[lead.stage] || 'default'} size="sm">{lead.stage}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <Progress value={lead.score} variant={scoreColor(lead.score)} />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {lead.lastTouchedAt ? formatDate(lead.lastTouchedAt, 'short') : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </span>
          <div className="flex gap-1">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button size="sm" variant="secondary" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
