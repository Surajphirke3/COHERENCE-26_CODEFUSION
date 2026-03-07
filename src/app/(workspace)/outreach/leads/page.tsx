'use client'

import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, Users, Trash2, Loader2, Search } from 'lucide-react'
import useSWR, { mutate } from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const statusColors: Record<string, string> = {
  new: 'var(--brand-100)',
  contacted: 'var(--info-bg)',
  in_sequence: 'var(--warning-bg)',
  replied: 'var(--success-bg)',
  converted: 'var(--success-bg)',
  opted_out: 'var(--bg-sunken)',
  bounced: 'var(--danger-bg)',
}

const statusTextColors: Record<string, string> = {
  new: 'var(--text-brand)',
  contacted: 'var(--info-text)',
  in_sequence: 'var(--warning-text)',
  replied: 'var(--success-text)',
  converted: 'var(--success-text)',
  opted_out: 'var(--text-tertiary)',
  bounced: 'var(--danger-text)',
}

export default function LeadsPage() {
  const { data, isLoading } = useSWR('/api/leads', fetcher)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [search, setSearch] = useState('')

  const leads = data?.leads || []

  const filteredLeads = leads.filter((lead: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      lead.firstName?.toLowerCase().includes(q) ||
      lead.lastName?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.company?.toLowerCase().includes(q)
    )
  })

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()

      if (!res.ok) {
        setMessage({ text: result.error || 'Import failed', type: 'error' })
      } else {
        setMessage({ text: result.message, type: 'success' })
        mutate('/api/leads')
      }
    } catch {
      setMessage({ text: 'Something went wrong', type: 'error' })
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }, [handleUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }, [handleUpload])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    await fetch(`/api/leads?id=${id}`, { method: 'DELETE' })
    mutate('/api/leads')
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Leads</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
          Import and manage your outreach leads
        </p>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? 'var(--brand-500)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '24px',
          background: dragOver ? 'var(--brand-50)' : 'var(--bg-surface)',
          transition: 'all 150ms ease',
          cursor: 'pointer',
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Importing leads...</span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Upload size={22} color="var(--brand-600)" />
              </div>
            </div>
            <p style={{ fontWeight: 500, marginBottom: '4px' }}>
              Drop your file here or click to browse
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              Supports .csv and .xlsx files
            </p>
          </>
        )}
      </div>

      {message && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          fontSize: '13px',
          background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          color: message.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
          borderLeft: `3px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '120px' }}>
          <Users size={16} color="var(--brand-600)" />
          <span style={{ fontWeight: 600, fontSize: '18px' }}>{leads.length}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Total Leads</span>
        </div>
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '120px' }}>
          <FileSpreadsheet size={16} color="var(--success)" />
          <span style={{ fontWeight: 600, fontSize: '18px' }}>{leads.filter((l: any) => l.status === 'new').length}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>New</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input
          className="input"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '36px', width: '100%', maxWidth: '320px' }}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
          Loading leads...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Users size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 500, marginBottom: '4px' }}>No leads yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Upload a CSV or Excel file to import your leads
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 500, color: 'var(--text-tertiary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 500, color: 'var(--text-tertiary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 500, color: 'var(--text-tertiary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Company</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 500, color: 'var(--text-tertiary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 500, color: 'var(--text-tertiary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead: any) => (
                <tr key={lead._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{lead.email}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{lead.company || '—'}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{lead.title || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 500,
                      background: statusColors[lead.status] || 'var(--neutral-100)',
                      color: statusTextColors[lead.status] || 'var(--text-secondary)',
                    }}>
                      {lead.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => handleDelete(lead._id)}
                      className="btn-ghost"
                      style={{ padding: '4px', color: 'var(--text-tertiary)' }}
                      title="Delete lead"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
