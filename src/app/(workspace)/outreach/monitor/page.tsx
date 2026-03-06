'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, Clock, CheckCircle, XCircle, Pause, Ban, Users, Loader2, X, ChevronRight } from 'lucide-react'

interface Execution {
  _id: string
  status: string
  currentNodeId?: string
  stepHistory: Array<{
    nodeId: string
    nodeType: string
    executedAt: string
    result: string
    messageGenerated?: string
    delayUsedSeconds?: number
  }>
  nextExecutionAt?: string
  errorMessage?: string
  leadId?: {
    _id: string
    firstName: string
    lastName: string
    email: string
    company?: string
    status: string
  }
  workflowId?: {
    _id: string
    name: string
  }
  updatedAt: string
}

const COLUMNS = [
  { key: 'pending', label: 'Queued', icon: Clock, color: '#6b7280', bg: '#f3f4f6' },
  { key: 'running', label: 'Running', icon: Activity, color: '#2563eb', bg: '#dbeafe' },
  { key: 'paused', label: 'Delayed', icon: Pause, color: '#d97706', bg: '#fef3c7' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: '#059669', bg: '#d1fae5' },
  { key: 'failed', label: 'Failed', icon: XCircle, color: '#dc2626', bg: '#fee2e2' },
  { key: 'opted_out', label: 'Opted Out', icon: Ban, color: '#6b7280', bg: '#e5e7eb' },
]

export default function MonitorPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedExec, setSelectedExec] = useState<Execution | null>(null)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/outreach/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  const executions: Execution[] = stats?.recentExecutions || []
  const execStats = stats?.executions || {}

  const getColumnExecutions = (status: string) =>
    executions.filter(e => e.status === status).slice(0, 20)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Live Monitor</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
          Real-time view of your outreach execution pipeline
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '100px' }}>
          <Users size={16} color="var(--brand-600)" />
          <span style={{ fontWeight: 700, fontSize: '20px' }}>{stats?.total || 0}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Total Leads</span>
        </div>
        {COLUMNS.map(col => (
          <div
            key={col.key}
            className="card"
            style={{
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: 1,
              minWidth: '90px',
              borderLeft: `3px solid ${col.color}`,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '18px', color: col.color }}>
              {execStats[col.key] || 0}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{col.label}</span>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px' }}>
        {COLUMNS.map(col => {
          const colExecs = getColumnExecutions(col.key)
          const Icon = col.icon
          return (
            <div
              key={col.key}
              style={{
                minWidth: '220px',
                flex: 1,
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Column header */}
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '6px',
                  background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={12} color={col.color} />
                </div>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{col.label}</span>
                <span style={{
                  marginLeft: 'auto', fontSize: '11px', fontWeight: 600,
                  background: col.bg, color: col.color,
                  padding: '1px 6px', borderRadius: '9999px',
                }}>
                  {execStats[col.key] || 0}
                </span>
              </div>

              {/* Cards */}
              <div style={{ padding: '8px', flex: 1, overflowY: 'auto', maxHeight: '60vh', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {colExecs.length === 0 ? (
                  <div style={{ padding: '20px 8px', textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    No items
                  </div>
                ) : (
                  colExecs.map(exec => {
                    const lead = exec.leadId as any
                    return (
                      <div
                        key={exec._id}
                        onClick={() => setSelectedExec(exec)}
                        className="card"
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          transition: 'box-shadow 120ms ease',
                          borderLeft: `3px solid ${col.color}`,
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                        onMouseOut={(e) => (e.currentTarget.style.boxShadow = '')}
                      >
                        <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>
                          {lead ? `${lead.firstName} ${lead.lastName}` : 'Unknown Lead'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {lead?.email || ''}
                        </div>
                        {lead?.company && (
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
                            {lead.company}
                          </div>
                        )}
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                          {exec.stepHistory?.length || 0} steps · {new Date(exec.updatedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail panel (slide-in) */}
      {selectedExec && (
        <div
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: '400px', maxWidth: '100vw',
            background: 'var(--bg-elevated)',
            borderLeft: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{ fontWeight: 600, fontSize: '15px' }}>Execution Details</h3>
            <button onClick={() => setSelectedExec(null)} className="btn-ghost" style={{ padding: '4px' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {/* Lead info */}
            {selectedExec.leadId && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                  Lead
                </div>
                <div className="card" style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                    {(selectedExec.leadId as any).firstName} {(selectedExec.leadId as any).lastName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{(selectedExec.leadId as any).email}</div>
                  {(selectedExec.leadId as any).company && (
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {(selectedExec.leadId as any).company}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                Status
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
                  background: COLUMNS.find(c => c.key === selectedExec.status)?.bg || '#f3f4f6',
                  color: COLUMNS.find(c => c.key === selectedExec.status)?.color || '#6b7280',
                }}>
                  {selectedExec.status}
                </span>
                {selectedExec.errorMessage && (
                  <span style={{ fontSize: '12px', color: 'var(--danger-text)' }}>
                    {selectedExec.errorMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Workflow */}
            {selectedExec.workflowId && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                  Workflow
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{(selectedExec.workflowId as any).name}</div>
              </div>
            )}

            {/* Step history */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                Step History ({selectedExec.stepHistory?.length || 0} steps)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedExec.stepHistory || []).map((step, i) => (
                  <div key={i} className="card" style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <ChevronRight size={12} color="var(--text-tertiary)" />
                      <span style={{ fontWeight: 500, fontSize: '13px' }}>{step.nodeType}</span>
                      <span style={{
                        marginLeft: 'auto', fontSize: '10px', fontWeight: 500,
                        padding: '1px 6px', borderRadius: '9999px',
                        background: step.result === 'success' ? '#d1fae5' : step.result === 'failed' ? '#fee2e2' : '#f3f4f6',
                        color: step.result === 'success' ? '#065f46' : step.result === 'failed' ? '#dc2626' : '#6b7280',
                      }}>
                        {step.result}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {new Date(step.executedAt).toLocaleString()}
                    </div>
                    {step.delayUsedSeconds && (
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        Delay: {Math.round(step.delayUsedSeconds / 60)} min
                      </div>
                    )}
                    {step.messageGenerated && (
                      <div style={{
                        marginTop: '8px', padding: '8px 10px',
                        background: 'var(--bg-surface)', borderRadius: 'var(--radius)',
                        fontSize: '12px', color: 'var(--text-secondary)',
                        lineHeight: '1.5', whiteSpace: 'pre-wrap',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        {step.messageGenerated}
                      </div>
                    )}
                  </div>
                ))}
                {(!selectedExec.stepHistory || selectedExec.stepHistory.length === 0) && (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    No steps executed yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay when detail panel is open */}
      {selectedExec && (
        <div
          onClick={() => setSelectedExec(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)', zIndex: 49,
          }}
        />
      )}
    </div>
  )
}
