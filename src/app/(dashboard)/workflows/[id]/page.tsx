'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft, Copy, Save, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/contexts/toast-context';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type WorkflowNode = { id: string; type: string; config?: Record<string, unknown> };
type WorkflowEdge = { id: string; source: string; target: string; condition?: string };
type Workflow = {
  _id: string;
  name: string;
  description?: string;
  version: number;
  graph: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
  updatedAt: string;
};

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const { data, isLoading, mutate } = useSWR(`/api/workflows/${id}`, fetcher);
  const workflow: Workflow | null = data?.workflow || null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const hydrated = useMemo(() => ({
    name: workflow?.name || '',
    description: workflow?.description || '',
  }), [workflow?.name, workflow?.description]);

  React.useEffect(() => {
    setName(hydrated.name);
    setDescription(hydrated.description);
  }, [hydrated]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error();
      addToast('Workflow updated', 'success');
      mutate();
    } catch {
      addToast('Failed to update workflow', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClone = async () => {
    setIsCloning(true);
    try {
      const res = await fetch(`/api/workflows/${id}/clone`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const payload = await res.json();
      addToast('Workflow cloned', 'success');
      router.push(`/workflows/${payload.workflow._id}`);
    } catch {
      addToast('Failed to clone workflow', 'error');
    } finally {
      setIsCloning(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        addToast(payload?.error || 'Failed to delete workflow', 'error');
        return;
      }
      addToast('Workflow deleted', 'success');
      router.push('/workflows');
    } catch {
      addToast('Failed to delete workflow', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton variant="text" count={2} />
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton variant="card" className="h-56" />
          <Skeleton variant="card" className="h-56" />
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Workflow not found.</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => router.push('/workflows')}>Back to Workflows</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={workflow.name} subtitle={`Version ${workflow.version}`}>
        <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => router.push('/workflows')}>
          Back
        </Button>
        <Button variant="secondary" icon={<Copy size={16} />} loading={isCloning} onClick={handleClone}>
          Clone
        </Button>
        <Button variant="secondary" icon={<Save size={16} />} loading={isSaving} onClick={handleSave}>
          Save
        </Button>
        <Button variant="danger" icon={<Trash2 size={16} />} loading={isDeleting} onClick={handleDelete}>
          Delete
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Details</h3>
          <div className="space-y-4">
            <Input label="Workflow Name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors hover:border-border-hover focus:border-accent"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Updated {new Date(workflow.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Graph Summary</h3>
            <div className="flex items-center gap-2">
              <Badge size="sm" status="active">{workflow.graph.nodes.length} nodes</Badge>
              <Badge size="sm" status="paused">{workflow.graph.edges.length} edges</Badge>
            </div>
          </div>

          <div className="space-y-3">
            {workflow.graph.nodes.map((node) => {
              const outgoing = workflow.graph.edges.filter((edge) => edge.source === node.id);
              return (
                <div key={node.id} className="rounded-lg border border-border bg-white/2 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge size="sm" status="default">{node.type}</Badge>
                      <span className="text-sm font-medium text-foreground">{node.id}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{outgoing.length} outgoing</span>
                  </div>
                  {outgoing.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {outgoing.map((edge) => (
                        <span key={edge.id} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-muted-foreground">
                          {edge.source} → {edge.target}{edge.condition ? ` (${edge.condition})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
