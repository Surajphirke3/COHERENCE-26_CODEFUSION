'use client'

import { useState } from 'react'
import { Sparkles, ListTodo, FileSignature, MessageSquare, Loader2, Plus, ArrowRight } from 'lucide-react'
import { useProjects } from '@/lib/hooks/useProjects'
import { toast } from 'sonner'
import StatusBadge from '@/components/shared/StatusBadge'

type Tool = 'task-generator' | 'summarizer' | 'prd-writer'

export default function AIPage() {
  const [activeTool, setActiveTool] = useState<Tool>('task-generator')
  const { projects } = useProjects()

  const tools = [
    { id: 'task-generator' as Tool, label: 'Task Generator', icon: ListTodo, desc: 'Break down features into actionable tasks' },
    { id: 'summarizer' as Tool, label: 'Note Summarizer', icon: MessageSquare, desc: 'Summarize meetings and long text' },
    { id: 'prd-writer' as Tool, label: 'PRD Writer', icon: FileSignature, desc: 'Generate a full PRD from a brief' },
  ]

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'var(--primary-muted)', borderRadius: 'var(--radius-md)' }}>
            <Sparkles size={22} color="var(--primary)" />
          </div>
          <h1>AI Assistant</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Three focused tools that actually do work. Powered by Groq.</p>
      </div>

      {/* Tool Selector */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className="card"
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                background: isActive ? 'var(--primary-muted)' : 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '200px',
                textAlign: 'left',
              }}
            >
              <Icon size={20} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{tool.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tool.desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Tool Panels */}
      {activeTool === 'task-generator' && <TaskGeneratorPanel projects={projects} />}
      {activeTool === 'summarizer' && <SummarizerPanel />}
      {activeTool === 'prd-writer' && <PRDWriterPanel />}
    </div>
  )
}

/* ─── Task Generator ──────────────────────────────────── */
function TaskGeneratorPanel({ projects }: { projects: any[] }) {
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)

  const handleGenerate = async () => {
    if (!description) return
    setLoading(true)
    setResults(null)
    try {
      const res = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureDescription: description,
          projectContext: projects.find((p) => p._id === projectId)?.name || '',
        }),
      })
      const data = await res.json()
      setResults(data.tasks || [])
    } catch {
      toast.error('AI generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAll = async () => {
    if (!projectId || !results) return toast.error('Select a project first')
    try {
      for (const task of results) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            priority: task.priority,
            projectId,
            status: 'todo',
          }),
        })
      }
      toast.success(`Added ${results.length} tasks to project!`)
      setResults(null)
      setDescription('')
    } catch {
      toast.error('Failed to add tasks')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="ai-grid">
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Describe your feature</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="label">Project</label>
            <select className="select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select a project…</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Feature Description *</label>
            <textarea className="textarea" rows={6} placeholder="Describe the feature you want to build. Be specific — the AI will break it into tasks." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={handleGenerate} disabled={loading || !description}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</> : <><Sparkles size={16} /> Generate Tasks</>}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', minHeight: '300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Generated Tasks</h3>
          {results && results.length > 0 && (
            <button className="btn-primary" onClick={handleAddAll} style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
              <Plus size={14} /> Add All to Project
            </button>
          )}
        </div>
        {!results && !loading && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tasks will appear here after generation.</p>}
        {loading && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating tasks…</div>}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((task: any, i: number) => (
              <div key={i} style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.875rem' }}>{task.title}</strong>
                  <StatusBadge status={task.priority} />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{task.description}</p>
                {task.estimatedHours && <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>~{task.estimatedHours}h</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Summarizer ──────────────────────────────────────── */
function SummarizerPanel() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ summary: string; decisions: string[]; actionItems: { task: string; owner?: string }[] } | null>(null)

  const handleSummarize = async () => {
    if (!text) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      toast.error('Summarization failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="ai-grid">
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Paste your notes</h3>
        <textarea className="textarea" rows={12} placeholder="Paste meeting notes, brainstorms, or any long text here…" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-primary" onClick={handleSummarize} disabled={loading || !text} style={{ marginTop: '12px' }}>
          {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Summarizing…</> : <><Sparkles size={16} /> Summarize</>}
        </button>
      </div>
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Summary</h3>
        {!result && !loading && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Summary will appear here.</p>}
        {loading && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Working…</div>}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Overview</h4>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{result.summary}</p>
            </div>
            {result.decisions?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Key Decisions</h4>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {result.decisions.map((d: string, i: number) => <li key={i} style={{ fontSize: '0.875rem' }}>{d}</li>)}
                </ul>
              </div>
            )}
            {result.actionItems?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Action Items</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.actionItems.map((item: any, i: number) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: '0.875rem', border: '1px solid var(--border)' }}>
                      <ArrowRight size={12} style={{ display: 'inline', marginRight: '6px' }} />
                      {item.task}{item.owner && <span style={{ color: 'var(--primary)', marginLeft: '6px' }}>@{item.owner}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── PRD Writer ──────────────────────────────────────── */
function PRDWriterPanel() {
  const [form, setForm] = useState({ productName: '', goals: '', users: '', constraints: '' })
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')

  const handleGenerate = async () => {
    if (!form.productName) return
    setLoading(true)
    setOutput('')
    try {
      const res = await fetch('/api/ai/prd-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          setOutput((prev) => prev + decoder.decode(value))
        }
      }
    } catch {
      toast.error('PRD generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAsDoc = async () => {
    try {
      await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `PRD: ${form.productName}`,
          type: 'prd',
          content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: output }] }] },
        }),
      })
      toast.success('PRD saved to Docs!')
    } catch {
      toast.error('Failed to save')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }} className="ai-grid">
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Product Brief</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="label">Product Name *</label>
            <input className="input" placeholder="e.g. TaskFlow" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
          </div>
          <div>
            <label className="label">Goals</label>
            <textarea className="textarea" rows={3} placeholder="What are you trying to achieve?" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
          </div>
          <div>
            <label className="label">Target Users</label>
            <input className="input" placeholder="Who is this for?" value={form.users} onChange={(e) => setForm({ ...form, users: e.target.value })} />
          </div>
          <div>
            <label className="label">Constraints</label>
            <input className="input" placeholder="Budget, timeline, tech limits" value={form.constraints} onChange={(e) => setForm({ ...form, constraints: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={handleGenerate} disabled={loading || !form.productName}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Writing…</> : <><FileSignature size={16} /> Generate PRD</>}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', minHeight: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Generated PRD</h3>
          {output && (
            <button className="btn-secondary" onClick={handleSaveAsDoc} style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
              Save to Docs
            </button>
          )}
        </div>
        {!output && !loading && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Your PRD will stream here in real-time.</p>}
        {(output || loading) && (
          <div style={{ fontSize: '0.875rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {output}
            {loading && <span style={{ display: 'inline-block', width: '8px', height: '16px', background: 'var(--primary)', animation: 'blink 1s infinite', marginLeft: '2px', verticalAlign: 'text-bottom' }} />}
          </div>
        )}
      </div>
    </div>
  )
}
