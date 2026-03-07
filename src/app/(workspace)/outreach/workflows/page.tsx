'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import { Plus, GitBranch, Trash2, Play, Pause, Loader2, Mail, Users, Repeat, Zap, X, FileText } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const statusStyles: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'var(--neutral-100)', color: 'var(--text-secondary)' },
  active: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  paused: { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
  archived: { bg: 'var(--neutral-100)', color: 'var(--text-tertiary)' },
}

// ── Prebuilt Sales Workflow Templates ──
// Every template includes a Generate Leads node (AI Generated, 5 samples)
// so they work out of the box — just add your API key in Settings and execute.
const WORKFLOW_TEMPLATES = [
  {
    key: 'cold-email',
    name: 'Cold Email Outreach',
    description: 'AI writes personalized cold emails and sends them. Just add your API key and run.',
    icon: Mail,
    color: '#1A56DB',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'Start Campaign', nodeType: 'trigger', description: 'Kicks off the workflow' } },
      { id: 'gen_leads', type: 'generateLeads', position: { x: 300, y: 180 }, data: { label: 'Generate 5 Leads', nodeType: 'generateLeads', description: 'Creates sample leads to test with', leadCount: 5, leadSource: 'ai_generated' } },
      { id: 'ai_1', type: 'aiMessage', position: { x: 300, y: 320 }, data: { label: 'AI Cold Email', nodeType: 'aiMessage', description: 'AI writes a personalized email', promptTemplate: 'Write a personalized cold email to {{firstName}} who is {{title}} at {{company}}. Keep it short (3-4 sentences), friendly, professional. Include a clear call-to-action.' } },
      { id: 'send_1', type: 'sendEmail', position: { x: 300, y: 460 }, data: { label: 'Send Email', nodeType: 'sendEmail', description: 'Sends the AI email (simulated if no SMTP)', subject: '' } },
      { id: 'tag_1', type: 'tagLead', position: { x: 300, y: 600 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted', description: 'Updates lead status' } },
      { id: 'end_1', type: 'end', position: { x: 300, y: 740 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'gen_leads' },
      { id: 'e2', source: 'gen_leads', target: 'ai_1' },
      { id: 'e3', source: 'ai_1', target: 'send_1' },
      { id: 'e4', source: 'send_1', target: 'tag_1' },
      { id: 'e5', source: 'tag_1', target: 'end_1' },
    ],
  },
  {
    key: 'linkedin-outreach',
    name: 'LinkedIn Outreach',
    description: 'AI crafts LinkedIn connection requests and follow-up messages for your leads.',
    icon: Users,
    color: '#0077B5',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'Start LinkedIn Campaign', nodeType: 'trigger', description: 'Kicks off the workflow' } },
      { id: 'gen_leads', type: 'generateLeads', position: { x: 300, y: 180 }, data: { label: 'Generate 5 Leads', nodeType: 'generateLeads', description: 'Creates sample leads', leadCount: 5, leadSource: 'ai_generated' } },
      { id: 'ai_1', type: 'aiMessage', position: { x: 300, y: 320 }, data: { label: 'Connection Request', nodeType: 'aiMessage', description: 'AI writes connection note', promptTemplate: 'Write a short LinkedIn connection request to {{firstName}}, {{title}} at {{company}}. Under 300 characters. Be genuine.' } },
      { id: 'tag_1', type: 'tagLead', position: { x: 300, y: 460 }, data: { label: 'Mark In Sequence', nodeType: 'tagLead', tag: 'in_sequence' } },
      { id: 'ai_2', type: 'aiMessage', position: { x: 300, y: 600 }, data: { label: 'Intro Message', nodeType: 'aiMessage', description: 'AI writes intro after accept', promptTemplate: 'Write a friendly LinkedIn message to {{firstName}} at {{company}} after they accepted your connection. Introduce yourself briefly, suggest a quick call. Keep it conversational.' } },
      { id: 'end_1', type: 'end', position: { x: 300, y: 740 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'gen_leads' },
      { id: 'e2', source: 'gen_leads', target: 'ai_1' },
      { id: 'e3', source: 'ai_1', target: 'tag_1' },
      { id: 'e4', source: 'tag_1', target: 'ai_2' },
      { id: 'e5', source: 'ai_2', target: 'end_1' },
    ],
  },
  {
    key: 'follow-up-sequence',
    name: 'Multi-Touch Follow-up',
    description: 'AI generates 3 follow-up emails with increasing value. Ready to run.',
    icon: Repeat,
    color: '#7C3AED',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'Start Follow-ups', nodeType: 'trigger' } },
      { id: 'gen_leads', type: 'generateLeads', position: { x: 300, y: 180 }, data: { label: 'Generate 5 Leads', nodeType: 'generateLeads', description: 'Creates sample leads', leadCount: 5, leadSource: 'ai_generated' } },
      { id: 'ai_1', type: 'aiMessage', position: { x: 300, y: 320 }, data: { label: 'Touch 1: Value Add', nodeType: 'aiMessage', description: 'Share useful insight', promptTemplate: 'Write a follow-up email to {{firstName}} at {{company}}. Share a relevant industry insight. Keep it brief and valuable. 3-4 sentences max.' } },
      { id: 'send_1', type: 'sendEmail', position: { x: 300, y: 460 }, data: { label: 'Send Touch 1', nodeType: 'sendEmail', subject: '' } },
      { id: 'ai_2', type: 'aiMessage', position: { x: 300, y: 600 }, data: { label: 'Touch 2: Case Study', nodeType: 'aiMessage', description: 'Reference success story', promptTemplate: 'Write a second follow-up email to {{firstName}} at {{company}}. Mention a success story with specific results. End with a soft CTA.' } },
      { id: 'send_2', type: 'sendEmail', position: { x: 300, y: 740 }, data: { label: 'Send Touch 2', nodeType: 'sendEmail', subject: '' } },
      { id: 'tag_1', type: 'tagLead', position: { x: 300, y: 880 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'end_1', type: 'end', position: { x: 300, y: 1020 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'gen_leads' },
      { id: 'e2', source: 'gen_leads', target: 'ai_1' },
      { id: 'e3', source: 'ai_1', target: 'send_1' },
      { id: 'e4', source: 'send_1', target: 'ai_2' },
      { id: 'e5', source: 'ai_2', target: 'send_2' },
      { id: 'e6', source: 'send_2', target: 'tag_1' },
      { id: 'e7', source: 'tag_1', target: 'end_1' },
    ],
  },
  {
    key: 'lead-qualifier',
    name: 'Lead Qualifier + Outreach',
    description: 'AI qualifies leads, then sends personalized emails only to qualified ones.',
    icon: Zap,
    color: '#059669',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'Start Pipeline', nodeType: 'trigger' } },
      { id: 'gen_leads', type: 'generateLeads', position: { x: 300, y: 180 }, data: { label: 'Generate 5 Leads', nodeType: 'generateLeads', description: 'Creates sample leads', leadCount: 5, leadSource: 'ai_generated' } },
      { id: 'condition_1', type: 'condition', position: { x: 300, y: 320 }, data: { label: 'Has Company?', nodeType: 'condition', conditionField: 'hasCompany', description: 'Route based on company info' } },
      { id: 'ai_1', type: 'aiMessage', position: { x: 100, y: 480 }, data: { label: 'AI Research + Email', nodeType: 'aiMessage', description: 'AI writes tailored outreach', promptTemplate: 'Write a highly personalized outreach email to {{firstName}}, who is {{title}} at {{company}}. Make it specific to their role. Include a clear value proposition in 3-4 sentences.' } },
      { id: 'send_1', type: 'sendEmail', position: { x: 100, y: 620 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'tag_qualified', type: 'tagLead', position: { x: 100, y: 760 }, data: { label: 'Mark Qualified', nodeType: 'tagLead', tag: 'in_sequence' } },
      { id: 'tag_cold', type: 'tagLead', position: { x: 500, y: 480 }, data: { label: 'Mark Cold', nodeType: 'tagLead', tag: 'new', description: 'Needs more info' } },
      { id: 'end_1', type: 'end', position: { x: 300, y: 900 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'gen_leads' },
      { id: 'e2', source: 'gen_leads', target: 'condition_1' },
      { id: 'e3', source: 'condition_1', target: 'ai_1' },
      { id: 'e4', source: 'condition_1', target: 'tag_cold' },
      { id: 'e5', source: 'ai_1', target: 'send_1' },
      { id: 'e6', source: 'send_1', target: 'tag_qualified' },
      { id: 'e7', source: 'tag_qualified', target: 'end_1' },
      { id: 'e8', source: 'tag_cold', target: 'end_1' },
    ],
  },
]

export default function WorkflowsPage() {
  const { data, isLoading } = useSWR('/api/workflows', fetcher)
  const [creating, setCreating] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
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

  const handleCreateFromTemplate = async (template: typeof WORKFLOW_TEMPLATES[0]) => {
    setCreating(true)
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          nodes: template.nodes,
          edges: template.edges,
        }),
      })
      const result = await res.json()
      if (res.ok && result.workflow) {
        window.location.href = `/outreach/workflows/${result.workflow._id}/builder`
      }
    } finally {
      setCreating(false)
      setShowTemplates(false)
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-ghost"
            onClick={() => setShowTemplates(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-subtle)', padding: '8px 14px', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 500 }}
          >
            <FileText size={16} /> Use Template
          </button>
          <button className="btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
            Blank Workflow
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
          Loading...
        </div>
      ) : workflows.length === 0 ? (
        <div>
          <div className="card" style={{ padding: '48px', textAlign: 'center', marginBottom: '32px' }}>
            <GitBranch size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 500, marginBottom: '4px' }}>No workflows yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
              Start from scratch or pick a prebuilt sales template
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                <Plus size={16} /> Blank Workflow
              </button>
              <button
                className="btn-ghost"
                onClick={() => setShowTemplates(true)}
                style={{ border: '1px solid var(--border-subtle)', padding: '8px 14px', borderRadius: 'var(--radius)' }}
              >
                <FileText size={16} /> Use Template
              </button>
            </div>
          </div>

          {/* Show templates inline when no workflows */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Sales Templates</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {WORKFLOW_TEMPLATES.map(tpl => {
                const Icon = tpl.icon
                return (
                  <button
                    key={tpl.key}
                    className="card"
                    onClick={() => handleCreateFromTemplate(tpl)}
                    disabled={creating}
                    style={{ padding: '20px', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', transition: 'all 150ms ease', width: '100%' }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = tpl.color; e.currentTarget.style.boxShadow = `0 0 0 1px ${tpl.color}30` }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: tpl.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} color={tpl.color} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{tpl.name}</div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5, margin: 0 }}>{tpl.description}</p>
                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {tpl.nodes.length} nodes · {tpl.edges.length} connections
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
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

      {/* Template Picker Modal */}
      {showTemplates && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowTemplates(false)}
        >
          <div
            style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '24px', maxWidth: '720px', width: '90%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Sales Workflow Templates</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Choose a template to get started quickly</p>
              </div>
              <button onClick={() => setShowTemplates(false)} className="btn-ghost" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {WORKFLOW_TEMPLATES.map(tpl => {
                const Icon = tpl.icon
                return (
                  <button
                    key={tpl.key}
                    onClick={() => handleCreateFromTemplate(tpl)}
                    disabled={creating}
                    style={{ padding: '20px', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '10px', background: 'var(--bg-elevated)', transition: 'all 150ms ease', width: '100%' }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = tpl.color; e.currentTarget.style.boxShadow = `0 0 0 1px ${tpl.color}30` }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: tpl.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} color={tpl.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{tpl.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{tpl.nodes.length} nodes</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{tpl.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
