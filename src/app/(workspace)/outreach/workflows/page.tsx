'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import { Plus, GitBranch, Trash2, Play, Pause, Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const statusStyles: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'var(--neutral-100)', color: 'var(--text-secondary)' },
  active: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  paused: { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
  archived: { bg: 'var(--neutral-100)', color: 'var(--text-tertiary)' },
}

export default function WorkflowsPage() {
  const { data, isLoading } = useSWR('/api/workflows', fetcher)
  const [creating, setCreating] = useState(false)
  const workflows = data?.workflows || []

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Workflow' }),
      })
      const result = await res.json()
      if (res.ok && result.workflow) {
        window.location.href = `/outreach/workflows/${result.workflow._id}/builder`
      }
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workflow?')) return
    await fetch(`/api/workflows/${id}`, { method: 'DELETE' })
    mutate('/api/workflows')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Workflows</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
            Design and manage your outreach sequences
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate} disabled={creating}>
          {creating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
          New Workflow
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
          Loading...
        </div>
      ) : workflows.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <GitBranch size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 500, marginBottom: '4px' }}>No workflows yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
            Create your first outreach workflow
          </p>
          <button className="btn-primary" onClick={handleCreate} disabled={creating}>
            <Plus size={16} /> Create Workflow
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {workflows.map((wf: any) => {
            const style = statusStyles[wf.status] || statusStyles.draft
            return (
              <div key={wf._id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                    background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <GitBranch size={18} color="var(--brand-600)" />
                  </div>
                  <div>
                    <Link
                      href={`/outreach/workflows/${wf._id}/builder`}
                      style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      {wf.name}
                    </Link>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {wf.nodes?.length || 0} nodes · Updated {new Date(wf.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500,
                    background: style.bg, color: style.color,
                  }}>
                    {wf.status}
                  </span>
                  {wf.status === 'active' ? (
                    <button className="btn-ghost" style={{ padding: '4px' }} title="Pause">
                      <Pause size={14} />
                    </button>
                  ) : wf.status === 'draft' ? (
                    <Link href={`/outreach/workflows/${wf._id}/builder`} className="btn-ghost" style={{ padding: '4px' }} title="Edit">
                      <Play size={14} />
                    </Link>
                  ) : null}
                  <button className="btn-ghost" style={{ padding: '4px', color: 'var(--text-tertiary)' }} onClick={() => handleDelete(wf._id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
