'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Activity, Clock, CheckCircle, XCircle, Pause, Ban, Users, Loader2, X,
  LayoutGrid, List, RefreshCw, Mail, Bot, Tag, Zap, GitBranch, Flag,
  UserPlus, Timer, AlertTriangle, MessageSquare, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useT, useLanguageStore } from '@/lib/i18n/useLanguage'

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
  createdAt?: string
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

// Use CSS variable names — actual values come from the theme (globals.css)
// These are fallback/accent colors that work in both themes
const COLUMNS = [
  { key: 'pending', label: 'Queued', icon: Clock, cssVar: 'gray' },
  { key: 'running', label: 'Running', icon: Activity, cssVar: 'info' },
  { key: 'paused', label: 'Delayed', icon: Pause, cssVar: 'warning' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, cssVar: 'success' },
  { key: 'failed', label: 'Failed', icon: XCircle, cssVar: 'danger' },
  { key: 'opted_out', label: 'Opted Out', icon: Ban, cssVar: 'gray' },
]

const NODE_TYPE_ICONS: Record<string, { icon: any; cssVar: string }> = {
  trigger: { icon: Zap, cssVar: 'info' },
  generateLeads: { icon: UserPlus, cssVar: 'info' },
  aiMessage: { icon: Bot, cssVar: 'brand' },
  sendEmail: { icon: Mail, cssVar: 'success' },
  delay: { icon: Timer, cssVar: 'warning' },
  condition: { icon: GitBranch, cssVar: 'danger' },
  tagLead: { icon: Tag, cssVar: 'gray' },
  end: { icon: Flag, cssVar: 'gray' },
  n8n: { icon: Zap, cssVar: 'warning' },
}

// Map cssVar names to actual CSS variable references for bg/text/border
function themeColor(cssVar: string, type: 'text' | 'bg' | 'border'): string {
  if (cssVar === 'gray') {
    if (type === 'text') return 'var(--text-secondary)'
    if (type === 'bg') return 'var(--bg-sunken)'
    return 'var(--border-subtle)'
  }
  if (cssVar === 'brand') {
    if (type === 'text') return 'var(--text-brand)'
    if (type === 'bg') return 'var(--brand-50)'
    return 'var(--brand-100)'
  }
  // info, success, warning, danger
  if (type === 'text') return `var(--${cssVar}-text)`
  if (type === 'bg') return `var(--${cssVar}-bg)`
  return `var(--${cssVar}-border)`
}

function timeAgo(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diffSec < 10) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

export default function MonitorPage() {
  const t = useT()
  const { hydrate: hydrateLang } = useLanguageStore()
  useEffect(() => { hydrateLang() }, [hydrateLang])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedExec, setSelectedExec] = useState<Execution | null>(null)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [refreshing, setRefreshing] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set())

  const loadData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true)
    try {
      const res = await fetch('/api/outreach/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(() => loadData(), 5000)
    return () => clearInterval(interval)
  }, [loadData])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-600)' }} />
        <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>{t('common.loading')}</span>
      </div>
    )
  }

  const executions: Execution[] = stats?.recentExecutions || []
  const execStats = stats?.executions || {}
  const totalExecs = Object.values(execStats).reduce((a: number, b: any) => a + (b || 0), 0) as number

  const getColumnExecutions = (status: string) =>
    executions.filter(e => e.status === status).slice(0, 30)

  const toggleMessage = (idx: number) => {
    setExpandedMessages(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{t('monitor.title')}</h1>
            {(execStats.running || 0) > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '9999px', background: 'var(--info-bg)', color: 'var(--info-text)', fontSize: '11px', fontWeight: 600, border: '1px solid var(--info-border)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--info-text)', animation: 'pulse 2s infinite' }} />
                {execStats.running} active
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
            {t('monitor.realtime')} · Auto-refreshes every 5s
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => loadData(true)}
            className="btn-ghost"
            style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)' }}
            disabled={refreshing}
          >
            <RefreshCw size={13} style={refreshing ? { animation: 'spin 1s linear infinite' } : undefined} /> {t('monitor.refresh')}
          </button>
          <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <button
              onClick={() => setView('kanban')}
              style={{ padding: '6px 10px', border: 'none', cursor: 'pointer', background: view === 'kanban' ? 'var(--bg-hover)' : 'transparent', color: view === 'kanban' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView('table')}
              style={{ padding: '6px 10px', border: 'none', cursor: 'pointer', background: view === 'table' ? 'var(--bg-hover)' : 'transparent', color: view === 'table' ? 'var(--text-primary)' : 'var(--text-tertiary)', borderLeft: '1px solid var(--border-subtle)' }}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {/* Total leads card */}
        <div className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brand-50)', opacity: 0.5 }} />
          <Users size={16} color="var(--brand-600)" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1 }}>{stats?.total || 0}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Total Leads</div>
        </div>

        {/* Total executions card */}
        <div className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brand-50)', opacity: 0.5 }} />
          <Activity size={16} color="var(--text-brand)" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1 }}>{totalExecs}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Total Executions</div>
        </div>

        {/* Status cards */}
        {COLUMNS.filter(c => (execStats[c.key] || 0) > 0 || c.key === 'completed' || c.key === 'running').map(col => {
          const Icon = col.icon
          const count = execStats[col.key] || 0
          const pct = totalExecs > 0 ? Math.round((count / totalExecs) * 100) : 0
          return (
            <div key={col.key} className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '48px', height: '48px', borderRadius: '50%', background: themeColor(col.cssVar, 'bg'), opacity: 0.4 }} />
              <Icon size={16} color={themeColor(col.cssVar, 'text')} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1, color: themeColor(col.cssVar, 'text') }}>{count}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{col.label}</div>
              {totalExecs > 0 && (
                <div style={{ marginTop: '8px', height: '3px', borderRadius: '2px', background: themeColor(col.cssVar, 'bg') }}>
                  <div style={{ height: '100%', borderRadius: '2px', background: themeColor(col.cssVar, 'text'), width: `${pct}%`, transition: 'width 500ms ease' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {executions.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <Activity size={40} color="var(--text-tertiary)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{t('monitor.noExecutions')}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
            Go to Workflows, pick a template, add your API key in Settings, and click &ldquo;Save &amp; Execute&rdquo; to see your pipeline here.
          </p>
        </div>
      ) : view === 'kanban' ? (
        /* ─── Kanban View ─── */
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px' }}>
          {COLUMNS.map(col => {
            const colExecs = getColumnExecutions(col.key)
            const Icon = col.icon
            return (
              <div
                key={col.key}
                style={{
                  minWidth: '240px',
                  flex: 1,
                  background: 'var(--bg-sunken)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '12px 12px 0 0',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: themeColor(col.cssVar, 'bg'), display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={14} color={themeColor(col.cssVar, 'text')} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>{col.label}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: 700,
                    background: themeColor(col.cssVar, 'bg'), color: themeColor(col.cssVar, 'text'),
                    padding: '2px 8px', borderRadius: '9999px', minWidth: '24px', textAlign: 'center',
                  }}>
                    {execStats[col.key] || 0}
                  </span>
                </div>

                <div style={{ padding: '8px', flex: 1, overflowY: 'auto', maxHeight: '55vh', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {colExecs.length === 0 ? (
                    <div style={{ padding: '28px 8px', textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)', opacity: 0.7 }}>
                      Empty
                    </div>
                  ) : (
                    colExecs.map(exec => {
                      const lead = exec.leadId as any
                      const steps = exec.stepHistory || []
                      return (
                        <div
                          key={exec._id}
                          onClick={() => setSelectedExec(exec)}
                          style={{
                            padding: '12px 14px',
                            cursor: 'pointer',
                            transition: 'all 120ms ease',
                            borderRadius: '10px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: 'var(--shadow-xs)',
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
                          onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: themeColor(col.cssVar, 'bg'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 700, color: themeColor(col.cssVar, 'text') }}>
                              {lead ? lead.firstName?.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {lead ? `${lead.firstName} ${lead.lastName}` : 'Unknown Lead'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {lead?.company || lead?.email || ''}
                              </div>
                            </div>
                          </div>

                          {/* Step progress dots */}
                          {steps.length > 0 && (
                            <div style={{ display: 'flex', gap: '3px', marginBottom: '6px', flexWrap: 'wrap' }}>
                              {steps.map((s, i) => {
                                const nodeInfo = NODE_TYPE_ICONS[s.nodeType] || NODE_TYPE_ICONS.trigger
                                return (
                                  <div
                                    key={i}
                                    title={`${s.nodeType}: ${s.result}`}
                                    style={{
                                      width: '18px', height: '18px', borderRadius: '4px',
                                      background: s.result === 'success' ? themeColor(nodeInfo.cssVar, 'bg') : s.result === 'failed' ? 'var(--danger-bg)' : 'var(--bg-sunken)',
                                      border: `1px solid ${s.result === 'success' ? themeColor(nodeInfo.cssVar, 'border') : s.result === 'failed' ? 'var(--danger-border)' : 'var(--border-subtle)'}`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                  >
                                    {(() => { const SIcon = nodeInfo.icon; return <SIcon size={9} color={s.result === 'failed' ? 'var(--danger-text)' : themeColor(nodeInfo.cssVar, 'text')} /> })()}
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                            <span>{steps.length} step{steps.length !== 1 ? 's' : ''}</span>
                            <span>{timeAgo(exec.updatedAt)}</span>
                          </div>

                          {exec.errorMessage && (
                            <div style={{ marginTop: '6px', padding: '4px 8px', borderRadius: '6px', background: 'var(--danger-bg)', fontSize: '10px', color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--danger-border)' }}>
                              <AlertTriangle size={10} /> {exec.errorMessage.slice(0, 60)}{exec.errorMessage.length > 60 ? '...' : ''}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ─── Table View ─── */
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>Lead</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>Workflow</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>Steps</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {executions.slice(0, 50).map(exec => {
                const lead = exec.leadId as any
                const col = COLUMNS.find(c => c.key === exec.status) || COLUMNS[0]
                return (
                  <tr
                    key={exec._id}
                    onClick={() => setSelectedExec(exec)}
                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 80ms ease' }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 500 }}>{lead ? `${lead.firstName} ${lead.lastName}` : 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{lead?.email || ''}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {(exec.workflowId as any)?.name || '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
                        background: themeColor(col.cssVar, 'bg'), color: themeColor(col.cssVar, 'text'),
                      }}>
                        {col.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {exec.stepHistory?.length || 0}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                      {timeAgo(exec.updatedAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {executions.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              No executions to show
            </div>
          )}
        </div>
      )}

      {/* ─── Detail Slide-in Panel ─── */}
      {selectedExec && (
        <>
          <div
            onClick={() => { setSelectedExec(null); setExpandedMessages(new Set()) }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 49, backdropFilter: 'blur(2px)' }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: '460px', maxWidth: '100vw',
            background: 'var(--bg-elevated)',
            borderLeft: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-2xl)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Panel header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-sunken)',
            }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>Execution Details</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {selectedExec._id.slice(-8)}</span>
              </div>
              <button onClick={() => { setSelectedExec(null); setExpandedMessages(new Set()) }} className="btn-ghost" style={{ padding: '6px', borderRadius: '8px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {/* Lead card */}
              {selectedExec.leadId && (() => {
                const lead = selectedExec.leadId as any
                return (
                  <div style={{
                    padding: '16px', borderRadius: '12px', marginBottom: '20px',
                    background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-hover))',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--brand-50)', color: 'var(--brand-600)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '16px',
                      }}>
                        {lead.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{lead.firstName} {lead.lastName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lead.email}</div>
                        {lead.company && (
                          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '1px' }}>{lead.company}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, background: 'var(--info-bg)', color: 'var(--info-text)' }}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                )
              })()}

              {/* Status + Workflow row */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '6px' }}>Status</div>
                  {(() => {
                    const col = COLUMNS.find(c => c.key === selectedExec.status) || COLUMNS[0]
                    const Icon = col.icon
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon size={14} color={themeColor(col.cssVar, 'text')} />
                        <span style={{ fontWeight: 600, fontSize: '13px', color: themeColor(col.cssVar, 'text') }}>{col.label}</span>
                      </div>
                    )
                  })()}
                </div>
                {selectedExec.workflowId && (
                  <div style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '6px' }}>Workflow</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GitBranch size={14} color="var(--brand-600)" />
                      <span style={{ fontWeight: 500, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(selectedExec.workflowId as any).name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Error message */}
              {selectedExec.errorMessage && (
                <div style={{
                  padding: '12px 14px', borderRadius: '10px', marginBottom: '20px',
                  background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                }}>
                  <AlertTriangle size={16} color="var(--danger-text)" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div style={{ fontSize: '12px', color: 'var(--danger-text)', lineHeight: 1.5 }}>{selectedExec.errorMessage}</div>
                </div>
              )}

              {/* Step Timeline */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                  Step Timeline ({selectedExec.stepHistory?.length || 0})
                </div>

                <div style={{ position: 'relative', paddingLeft: '24px' }}>
                  {/* Vertical line */}
                  {(selectedExec.stepHistory?.length || 0) > 0 && (
                    <div style={{
                      position: 'absolute', left: '11px', top: '12px', bottom: '12px',
                      width: '2px', background: 'var(--border-subtle)',
                    }} />
                  )}

                  {(selectedExec.stepHistory || []).map((step, i) => {
                    const nodeInfo = NODE_TYPE_ICONS[step.nodeType] || NODE_TYPE_ICONS.trigger
                    const StepIcon = nodeInfo.icon
                    const isSuccess = step.result === 'success'
                    const isFailed = step.result === 'failed'
                    const hasMessage = !!step.messageGenerated
                    const isExpanded = expandedMessages.has(i)

                    return (
                      <div key={i} style={{ position: 'relative', paddingBottom: i < (selectedExec.stepHistory?.length || 0) - 1 ? '16px' : '0' }}>
                        {/* Node dot */}
                        <div style={{
                          position: 'absolute', left: '-24px', top: '2px',
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: isFailed ? 'var(--danger-bg)' : isSuccess ? themeColor(nodeInfo.cssVar, 'bg') : 'var(--bg-sunken)',
                          border: `2px solid ${isFailed ? 'var(--danger-text)' : isSuccess ? themeColor(nodeInfo.cssVar, 'text') : 'var(--border-default)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          zIndex: 1,
                        }}>
                          <StepIcon size={10} color={isFailed ? 'var(--danger-text)' : themeColor(nodeInfo.cssVar, 'text')} />
                        </div>

                        {/* Step content */}
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-elevated)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>
                              {step.nodeType === 'aiMessage' ? 'AI Message' :
                               step.nodeType === 'sendEmail' ? 'Send Email' :
                               step.nodeType === 'tagLead' ? 'Tag Lead' :
                               step.nodeType === 'generateLeads' ? 'Generate Leads' :
                               step.nodeType.charAt(0).toUpperCase() + step.nodeType.slice(1)}
                            </span>
                            <span style={{
                              fontSize: '10px', fontWeight: 600,
                              padding: '2px 8px', borderRadius: '9999px',
                              background: isSuccess ? 'var(--success-bg)' : isFailed ? 'var(--danger-bg)' : 'var(--bg-sunken)',
                              color: isSuccess ? 'var(--success-text)' : isFailed ? 'var(--danger-text)' : 'var(--text-tertiary)',
                            }}>
                              {step.result}
                            </span>
                          </div>

                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            {timeAgo(step.executedAt)} · {new Date(step.executedAt).toLocaleTimeString()}
                          </div>

                          {step.delayUsedSeconds != null && step.delayUsedSeconds > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11px', color: 'var(--warning-text)' }}>
                              <Timer size={10} /> Waited {step.delayUsedSeconds >= 3600 ? `${Math.round(step.delayUsedSeconds / 3600)}h` : `${Math.round(step.delayUsedSeconds / 60)}m`}
                            </div>
                          )}

                          {hasMessage && (
                            <div style={{ marginTop: '8px' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleMessage(i) }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  padding: '4px 8px', borderRadius: '6px',
                                  border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
                                  cursor: 'pointer', fontSize: '11px', color: 'var(--text-secondary)',
                                  width: '100%', justifyContent: 'space-between',
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MessageSquare size={10} />
                                  {isExpanded ? 'Hide message' : 'View message'}
                                </span>
                                {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                              </button>
                              {isExpanded && (
                                <div style={{
                                  marginTop: '6px', padding: '10px 12px',
                                  background: 'var(--bg-surface)', borderRadius: '8px',
                                  fontSize: '12px', color: 'var(--text-secondary)',
                                  lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                  border: '1px solid var(--border-subtle)',
                                  maxHeight: '200px', overflowY: 'auto',
                                }}>
                                  {step.messageGenerated}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {(!selectedExec.stepHistory || selectedExec.stepHistory.length === 0) && (
                    <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                      No steps executed yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
