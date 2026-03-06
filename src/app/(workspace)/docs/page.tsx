'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Plus, Search, Pin, FileText, X } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils/date'
import { getInitials } from '@/lib/utils/format'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const typeLabels: Record<string, string> = {
  prd: 'PRD',
  meeting_notes: 'Meeting Notes',
  technical: 'Technical',
  general: 'General',
}

const typeColors: Record<string, string> = {
  prd: '#8b5cf6',
  meeting_notes: '#f59e0b',
  technical: '#06b6d4',
  general: 'var(--text-muted)',
}

export default function DocsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const { data: docs, isLoading, mutate } = useSWR(
    `/api/docs?${search ? `search=${search}&` : ''}${typeFilter ? `type=${typeFilter}` : ''}`,
    fetcher,
    { refreshInterval: 15000 }
  )
  const [showCreate, setShowCreate] = useState(false)
  const [newDoc, setNewDoc] = useState({ title: '', type: 'general' })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      })
      const doc = await res.json()
      toast.success('Document created!')
      setShowCreate(false)
      setNewDoc({ title: '', type: 'general' })
      mutate()
    } catch {
      toast.error('Failed to create document')
    }
  }

  const handlePin = async (docId: string, isPinned: boolean) => {
    await fetch(`/api/docs/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !isPinned }),
    })
    mutate()
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1>Docs</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Document
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Search docs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['', 'prd', 'meeting_notes', 'technical', 'general'].map((t) => (
            <button
              key={t}
              className={typeFilter === t ? 'btn-primary' : 'btn-ghost'}
              onClick={() => setTypeFilter(t)}
              style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
            >
              {t ? typeLabels[t] : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Docs Grid */}
      {!docs || docs.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No documents yet"
          description="Create your first document to start building your knowledge base."
          action={
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Create Document
            </button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {docs.map((doc: any) => (
            <Link key={doc._id} href={`/docs/${doc._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: typeColors[doc.type], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {typeLabels[doc.type] || doc.type}
                  </span>
                  {doc.isPinned && <Pin size={12} color="var(--warning)" />}
                  <div style={{ marginLeft: 'auto' }}>
                    <button
                      className="btn-ghost"
                      style={{ padding: '2px' }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePin(doc._id, doc.isPinned) }}
                      title={doc.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin size={14} color={doc.isPinned ? 'var(--warning)' : 'var(--text-muted)'} />
                    </button>
                  </div>
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>{doc.title}</h3>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {doc.authorId && (
                    <div className="avatar avatar-sm" style={{ width: '20px', height: '20px', fontSize: '0.5rem' }}>
                      {getInitials(doc.authorId.name || 'U')}
                    </div>
                  )}
                  <span>{formatDate(doc.updatedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <>
          <div className="overlay" onClick={() => setShowCreate(false)} />
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>New Document</h2>
              <button className="btn-ghost" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="label">Title *</label>
                  <input className="input" placeholder="Document title" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="select" value={newDoc.type} onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}>
                    <option value="general">General</option>
                    <option value="prd">PRD</option>
                    <option value="meeting_notes">Meeting Notes</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
