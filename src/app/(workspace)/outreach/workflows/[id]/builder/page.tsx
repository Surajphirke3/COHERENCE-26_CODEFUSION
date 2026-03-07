'use client'

import { useState, useCallback, useEffect, use } from 'react'
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Save, Zap, Bot, Mail, Clock, GitFork, Tag, Flag, Loader2, ArrowLeft, ChevronRight, Play, X, UserPlus, Trash2, Settings, Key, Server } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// ── Node palette configuration ──
const NODE_PALETTE = [
  { type: 'trigger', label: 'Trigger', icon: Zap, color: '#1A56DB' },
  { type: 'generateLeads', label: 'Generate Leads', icon: UserPlus, color: '#0891B2' },
  { type: 'aiMessage', label: 'AI Message', icon: Bot, color: '#7C3AED' },
  { type: 'sendEmail', label: 'Send Email', icon: Mail, color: '#065F46' },
  { type: 'delay', label: 'Delay', icon: Clock, color: '#92400E' },
  { type: 'condition', label: 'Condition', icon: GitFork, color: '#991B1B' },
  { type: 'tagLead', label: 'Tag Lead', icon: Tag, color: '#1F2937' },
  { type: 'end', label: 'End', icon: Flag, color: '#374151' },
]

// ── Custom Node Component with delete button ──
function CustomNode({ id, data }: { id: string; data: any }) {
  const palette = NODE_PALETTE.find(p => p.type === data.nodeType) || NODE_PALETTE[0]
  const Icon = palette.icon

  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${palette.color}`,
      borderRadius: '10px',
      padding: '12px 16px',
      minWidth: '160px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      fontSize: '13px',
      position: 'relative',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: palette.color, width: 8, height: 8 }} />

      {/* Delete button on node */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (data.onDelete) data.onDelete(id)
        }}
        style={{
          position: 'absolute', top: '-8px', right: '-8px',
          width: '20px', height: '20px', borderRadius: '50%',
          background: '#ef4444', border: '2px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0, color: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          transition: 'transform 100ms ease',
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.15)' }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        title="Delete node"
      >
        <X size={10} strokeWidth={3} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '6px',
          background: palette.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} color={palette.color} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>{data.label}</div>
          {data.description && (
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{data.description}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: palette.color, width: 8, height: 8 }} />
    </div>
  )
}

const nodeTypes = { custom: CustomNode }

// ── Main Builder ──
export default function WorkflowBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [workflowName, setWorkflowName] = useState('Untitled Workflow')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [executing, setExecuting] = useState(false)
  const [execOutputs, setExecOutputs] = useState<any>(null)
  const [currentId, setCurrentId] = useState(id)
  const [sidebarTab, setSidebarTab] = useState<'nodes' | 'settings'>('nodes')
  const [wfConfig, setWfConfig] = useState({
    aiProvider: 'groq',
    aiApiKey: '',
    aiModel: 'llama-3.3-70b-versatile',
    aiBaseUrl: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFromEmail: '',
    smtpFromName: '',
    smtpSecure: false,
  })

  const AI_PROVIDERS = [
    { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'mixtral-8x7b-32768'] },
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'] },
    { id: 'sambanova', name: 'SambaNova', models: ['Meta-Llama-3.1-8B-Instruct', 'Meta-Llama-3.1-70B-Instruct'] },
    { id: 'openrouter', name: 'OpenRouter', models: ['mistralai/mistral-7b-instruct:free', 'meta-llama/llama-3-8b-instruct:free'] },
    { id: 'together', name: 'Together AI', models: ['meta-llama/Llama-3-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'] },
  ]

  // Delete a node and its connected edges
  const deleteNode = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId))
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
    setSelectedNode(prev => (prev?.id === nodeId ? null : prev))
    toast.success('Node removed')
  }, [setNodes, setEdges])

  // Load workflow
  useEffect(() => {
    if (currentId === 'new') {
      setLoading(false)
      return
    }
    fetch(`/api/workflows/${currentId}`)
      .then(r => r.json())
      .then(data => {
        if (data.workflow) {
          setWorkflowName(data.workflow.name || 'Untitled Workflow')
          // Load workflow config (API keys, SMTP)
          if (data.workflow.config) {
            const c = data.workflow.config
            setWfConfig(prev => ({
              ...prev,
              aiProvider: c.aiProvider || prev.aiProvider,
              aiApiKey: c.aiApiKey || prev.aiApiKey,
              aiModel: c.aiModel || prev.aiModel,
              aiBaseUrl: c.aiBaseUrl || prev.aiBaseUrl,
              smtpHost: c.smtpHost || prev.smtpHost,
              smtpPort: c.smtpPort || prev.smtpPort,
              smtpUser: c.smtpUser || prev.smtpUser,
              smtpPass: c.smtpPass || prev.smtpPass,
              smtpFromEmail: c.smtpFromEmail || prev.smtpFromEmail,
              smtpFromName: c.smtpFromName || prev.smtpFromName,
              smtpSecure: c.smtpSecure ?? prev.smtpSecure,
            }))
          }
          const loadedNodes = (data.workflow.nodes || []).map((n: any) => ({
            id: n.id,
            type: 'custom',
            position: n.position || { x: 0, y: 0 },
            data: { label: n.data?.label || n.type, nodeType: n.type, ...n.data, onDelete: deleteNode },
          }))
          const loadedEdges = (data.workflow.edges || []).map((e: any) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            animated: true,
            style: { stroke: '#6366f1' },
          }))
          setNodes(loadedNodes)
          setEdges(loadedEdges)
        }
      })
      .finally(() => setLoading(false))
  }, [currentId, setNodes, setEdges, deleteNode])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds => addEdge({ ...connection, animated: true, style: { stroke: '#6366f1' } }, eds))
    },
    [setEdges]
  )

  // Add node from palette
  const addNode = useCallback((type: string) => {
    const palette = NODE_PALETTE.find(p => p.type === type)!
    const newId = `${type}_${Date.now()}`
    const newNode: Node = {
      id: newId,
      type: 'custom',
      position: { x: 250 + Math.random() * 100, y: 100 + nodes.length * 120 },
      data: {
        label: palette.label,
        nodeType: type,
        description: '',
        onDelete: deleteNode,
        promptTemplate: type === 'aiMessage' ? 'Write a personalized cold email to {{firstName}} at {{company}}' : undefined,
        delayMinutes: type === 'delay' ? 60 : undefined,
        tag: type === 'tagLead' ? 'contacted' : undefined,
        leadCount: type === 'generateLeads' ? 10 : undefined,
        leadSource: type === 'generateLeads' ? 'manual' : undefined,
      },
    }
    setNodes(nds => [...nds, newNode])
  }, [nodes.length, setNodes, deleteNode])

  // Save workflow
  const handleSave = async () => {
    setSaving(true)
    try {
      const saveNodes = nodes.map(n => ({
        id: n.id,
        type: (n.data as any).nodeType || 'trigger',
        position: n.position,
        data: { ...n.data, onDelete: undefined },
      }))
      const saveEdges = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      }))

      if (currentId === 'new') {
        const res = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, nodes: saveNodes, edges: saveEdges, config: wfConfig }),
        })
        const result = await res.json()
        if (res.ok) {
          setCurrentId(result.workflow._id)
          window.history.replaceState(null, '', `/outreach/workflows/${result.workflow._id}/builder`)
          toast.success('Workflow created and saved!')
        } else {
          toast.error(result.error || 'Failed to create workflow')
        }
      } else {
        const res = await fetch(`/api/workflows/${currentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, nodes: saveNodes, edges: saveEdges, config: wfConfig }),
        })
        if (res.ok) {
          toast.success('Workflow saved!')
        } else {
          const result = await res.json()
          toast.error(result.error || 'Failed to save workflow')
        }
      }
    } catch {
      toast.error('Network error — could not save')
    } finally {
      setSaving(false)
    }
  }

  // Execute workflow — auto-saves first, checks for API key
  const handleExecute = async () => {
    // Check if AI API key is set (needed for aiMessage nodes)
    const hasAiNodes = nodes.some(n => (n.data as any).nodeType === 'aiMessage')
    if (hasAiNodes && !wfConfig.aiApiKey && !process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      toast.error('Add your AI API key in the Settings tab before executing', { duration: 5000 })
      setSidebarTab('settings')
      return
    }

    setExecuting(true)
    setExecOutputs(null)

    try {
      // Auto-save first so the server has the latest nodes, edges, and config
      const saveNodes = nodes.map(n => ({
        id: n.id,
        type: (n.data as any).nodeType || 'trigger',
        position: n.position,
        data: { ...n.data, onDelete: undefined },
      }))
      const saveEdges = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      }))

      let execId = currentId

      if (execId === 'new') {
        // Create the workflow first
        const createRes = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, nodes: saveNodes, edges: saveEdges, config: wfConfig }),
        })
        const createResult = await createRes.json()
        if (!createRes.ok) throw new Error(createResult.error || 'Failed to save workflow')
        execId = createResult.workflow._id
        setCurrentId(execId)
        window.history.replaceState(null, '', `/outreach/workflows/${execId}/builder`)
      } else {
        // Update existing workflow
        const saveRes = await fetch(`/api/workflows/${execId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, nodes: saveNodes, edges: saveEdges, config: wfConfig }),
        })
        if (!saveRes.ok) {
          const saveResult = await saveRes.json()
          throw new Error(saveResult.error || 'Failed to save before executing')
        }
      }

      toast.info('Workflow saved. Executing...')

      // Now execute
      const res = await fetch(`/api/workflows/${execId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: {} }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Execution failed')
      toast.success(data.message || 'Workflow executed successfully!')
      setExecOutputs(data)
    } catch (error: any) {
      toast.error(error.message || 'Execution failed')
      setExecOutputs({ error: error.message })
    } finally {
      setExecuting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--topbar-height))', margin: '-24px', overflow: 'hidden' }}>
      {/* Sidebar palette */}
      <div style={{
        width: '240px',
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <Link href="/outreach/workflows" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: '8px' }}>
            <ArrowLeft size={12} /> Back to Workflows
          </Link>
          <input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="input"
            style={{ fontSize: '14px', fontWeight: 600, padding: '6px 8px' }}
          />
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setSidebarTab('nodes')}
            style={{
              flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
              background: sidebarTab === 'nodes' ? 'var(--bg-elevated)' : 'transparent',
              color: sidebarTab === 'nodes' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: sidebarTab === 'nodes' ? '2px solid var(--brand-600)' : '2px solid transparent',
            }}
          >
            Nodes
          </button>
          <button
            onClick={() => setSidebarTab('settings')}
            style={{
              flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
              background: sidebarTab === 'settings' ? 'var(--bg-elevated)' : 'transparent',
              color: sidebarTab === 'settings' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: sidebarTab === 'settings' ? '2px solid var(--brand-600)' : '2px solid transparent',
            }}
          >
            <Settings size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Settings
          </button>
        </div>

        <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
          {sidebarTab === 'nodes' ? (
            <>
              <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px', padding: '0 4px' }}>
                Add Nodes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {NODE_PALETTE.map(item => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.type}
                      onClick={() => addNode(item.type)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 10px', borderRadius: 'var(--radius)',
                        border: 'none', background: 'transparent', cursor: 'pointer',
                        fontSize: '13px', color: 'var(--text-primary)', textAlign: 'left',
                        transition: 'background 120ms ease',
                        width: '100%',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: item.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={14} color={item.color} />
                      </div>
                      {item.label}
                    </button>
                  )
                })}
              </div>
              <div style={{ marginTop: '16px', padding: '8px 10px', borderRadius: 'var(--radius)', background: 'var(--bg-hover)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {edges.length} connection{edges.length !== 1 ? 's' : ''}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* AI Provider Settings */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                  <Key size={12} /> AI Provider
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>Provider</label>
                    <select
                      className="input"
                      value={wfConfig.aiProvider}
                      onChange={(e) => {
                        const prov = AI_PROVIDERS.find(p => p.id === e.target.value)
                        setWfConfig(c => ({ ...c, aiProvider: e.target.value, aiModel: prov?.models[0] || c.aiModel }))
                      }}
                    >
                      {AI_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>API Key</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="sk-... or gsk_..."
                      value={wfConfig.aiApiKey}
                      onChange={(e) => setWfConfig(c => ({ ...c, aiApiKey: e.target.value }))}
                    />
                    <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {wfConfig.aiApiKey ? '\u2713 Key set' : 'Required for AI nodes to work'}
                    </p>
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>Model</label>
                    <select
                      className="input"
                      value={wfConfig.aiModel}
                      onChange={(e) => setWfConfig(c => ({ ...c, aiModel: e.target.value }))}
                    >
                      {(AI_PROVIDERS.find(p => p.id === wfConfig.aiProvider)?.models || []).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>Custom Base URL (optional)</label>
                    <input
                      className="input"
                      placeholder="Leave empty for default"
                      value={wfConfig.aiBaseUrl}
                      onChange={(e) => setWfConfig(c => ({ ...c, aiBaseUrl: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                  <Server size={12} /> Email (SMTP)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>SMTP Host</label>
                    <input
                      className="input"
                      placeholder="smtp.gmail.com"
                      value={wfConfig.smtpHost}
                      onChange={(e) => setWfConfig(c => ({ ...c, smtpHost: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="label" style={{ fontSize: '11px' }}>Port</label>
                      <input
                        className="input"
                        type="number"
                        value={wfConfig.smtpPort}
                        onChange={(e) => setWfConfig(c => ({ ...c, smtpPort: parseInt(e.target.value) || 587 }))}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                      <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={wfConfig.smtpSecure}
                          onChange={(e) => setWfConfig(c => ({ ...c, smtpSecure: e.target.checked }))}
                        /> SSL
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>Username / Email</label>
                    <input
                      className="input"
                      placeholder="you@company.com"
                      value={wfConfig.smtpUser}
                      onChange={(e) => setWfConfig(c => ({ ...c, smtpUser: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>Password / App Password</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="App password"
                      value={wfConfig.smtpPass}
                      onChange={(e) => setWfConfig(c => ({ ...c, smtpPass: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>From Name</label>
                    <input
                      className="input"
                      placeholder="Your Name"
                      value={wfConfig.smtpFromName}
                      onChange={(e) => setWfConfig(c => ({ ...c, smtpFromName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>From Email</label>
                    <input
                      className="input"
                      placeholder="you@company.com"
                      value={wfConfig.smtpFromEmail}
                      onChange={(e) => setWfConfig(c => ({ ...c, smtpFromEmail: e.target.value }))}
                    />
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
                    {wfConfig.smtpHost ? '\u2713 SMTP configured — emails will be sent' : 'No SMTP — emails will be simulated'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%' }}
          >
            {saving ? (
              <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
            ) : (
              <><Save size={14} /> Save Workflow</>
            )}
          </button>
          <button
            className="btn-primary"
            onClick={handleExecute}
            disabled={executing || nodes.length === 0}
            style={{
              width: '100%',
              background: executing ? undefined : '#059669',
            }}
          >
            {executing ? (
              <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Executing…</>
            ) : (
              <><Play size={14} /> Save &amp; Execute</>
            )}
          </button>
        </div>
      </div>

      {/* Canvas + Output */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            onPaneClick={() => setSelectedNode(null)}
            nodeTypes={nodeTypes}
            deleteKeyCode="Delete"
            fitView
            style={{ width: '100%', height: '100%' }}
          >
            <Background gap={16} size={1} color="#e2e8f0" />
            <Controls />
            <MiniMap
              nodeColor={(n: any) => {
                const palette = NODE_PALETTE.find(p => p.type === n.data?.nodeType)
                return palette?.color || '#6b7280'
              }}
              style={{ borderRadius: '8px' }}
            />
          </ReactFlow>
        </div>

        {/* Execution Output Panel */}
        {execOutputs && (
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '12px 16px',
            background: 'var(--bg-elevated)',
            maxHeight: '220px',
            overflowY: 'auto',
            fontSize: '13px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>
                Execution Output
                {execOutputs.engine && (
                  <span style={{ fontSize: '11px', fontWeight: 500, marginLeft: '8px', padding: '2px 8px', borderRadius: '9999px', background: execOutputs.engine === 'n8n' ? '#dbeafe' : '#d1fae5', color: execOutputs.engine === 'n8n' ? '#1d4ed8' : '#065f46' }}>
                    {execOutputs.engine}
                  </span>
                )}
              </span>
              <button className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11px' }} onClick={() => setExecOutputs(null)}>
                Clear
              </button>
            </div>
            {execOutputs.leadsGenerated > 0 && (
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#d1fae5', color: '#065f46', fontSize: '12px', marginBottom: '8px' }}>
                Generated {execOutputs.leadsGenerated} leads from workflow
              </div>
            )}
            <pre style={{ fontSize: '12px', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-secondary)', margin: 0 }}>
              {JSON.stringify(execOutputs, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Node detail panel */}
      {selectedNode && (
        <div style={{
          width: '280px',
          background: 'var(--bg-elevated)',
          borderLeft: '1px solid var(--border-subtle)',
          padding: '16px',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 600, fontSize: '14px' }}>Node Settings</h3>
            <button onClick={() => setSelectedNode(null)} className="btn-ghost" style={{ padding: '4px' }}>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label className="label">Label</label>
              <input
                className="input"
                value={(selectedNode.data as any).label || ''}
                onChange={(e) => {
                  setNodes(nds => nds.map(n =>
                    n.id === selectedNode.id
                      ? { ...n, data: { ...n.data, label: e.target.value } }
                      : n
                  ))
                }}
              />
            </div>

            <div>
              <label className="label">Description</label>
              <input
                className="input"
                value={(selectedNode.data as any).description || ''}
                onChange={(e) => {
                  setNodes(nds => nds.map(n =>
                    n.id === selectedNode.id
                      ? { ...n, data: { ...n.data, description: e.target.value } }
                      : n
                  ))
                }}
              />
            </div>

            {(selectedNode.data as any).nodeType === 'aiMessage' && (
              <div>
                <label className="label">Prompt Template</label>
                <textarea
                  className="input"
                  rows={4}
                  value={(selectedNode.data as any).promptTemplate || ''}
                  onChange={(e) => {
                    setNodes(nds => nds.map(n =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, promptTemplate: e.target.value } }
                        : n
                    ))
                  }}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Variables: {'{{firstName}}'}, {'{{lastName}}'}, {'{{company}}'}, {'{{title}}'}
                </p>
              </div>
            )}

            {(selectedNode.data as any).nodeType === 'delay' && (
              <div>
                <label className="label">Delay (minutes)</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={(selectedNode.data as any).delayMinutes || 60}
                  onChange={(e) => {
                    setNodes(nds => nds.map(n =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, delayMinutes: parseInt(e.target.value) || 60 } }
                        : n
                    ))
                  }}
                />
              </div>
            )}

            {(selectedNode.data as any).nodeType === 'tagLead' && (
              <div>
                <label className="label">Tag / Status</label>
                <select
                  className="input"
                  value={(selectedNode.data as any).tag || 'contacted'}
                  onChange={(e) => {
                    setNodes(nds => nds.map(n =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, tag: e.target.value } }
                        : n
                    ))
                  }}
                >
                  <option value="in_sequence">In Sequence</option>
                  <option value="contacted">Contacted</option>
                  <option value="replied">Replied</option>
                  <option value="converted">Converted</option>
                  <option value="opted_out">Opted Out</option>
                </select>
              </div>
            )}

            {(selectedNode.data as any).nodeType === 'generateLeads' && (
              <>
                <div>
                  <label className="label">Number of Leads</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={100}
                    value={(selectedNode.data as any).leadCount || 10}
                    onChange={(e) => {
                      setNodes(nds => nds.map(n =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, leadCount: parseInt(e.target.value) || 10 } }
                          : n
                      ))
                    }}
                  />
                </div>
                <div>
                  <label className="label">Lead Source</label>
                  <select
                    className="input"
                    value={(selectedNode.data as any).leadSource || 'manual'}
                    onChange={(e) => {
                      setNodes(nds => nds.map(n =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, leadSource: e.target.value } }
                          : n
                      ))
                    }}
                  >
                    <option value="manual">Manual / CSV Import</option>
                    <option value="ai_generated">AI Generated (Sample)</option>
                  </select>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    AI Generated creates sample leads for testing
                  </p>
                </div>
              </>
            )}

            {(selectedNode.data as any).nodeType === 'sendEmail' && (
              <>
                <div>
                  <label className="label">Subject Line (optional)</label>
                  <input
                    className="input"
                    placeholder="Uses AI-generated subject if empty"
                    value={(selectedNode.data as any).subject || ''}
                    onChange={(e) => {
                      setNodes(nds => nds.map(n =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, subject: e.target.value } }
                          : n
                      ))
                    }}
                  />
                </div>
              </>
            )}

            {(selectedNode.data as any).nodeType === 'condition' && (
              <div>
                <label className="label">Condition Field</label>
                <select
                  className="input"
                  value={(selectedNode.data as any).conditionField || 'status'}
                  onChange={(e) => {
                    setNodes(nds => nds.map(n =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, conditionField: e.target.value } }
                        : n
                    ))
                  }}
                >
                  <option value="status">Lead Status</option>
                  <option value="hasEmail">Has Email</option>
                  <option value="hasCompany">Has Company</option>
                  <option value="hasPhone">Has Phone</option>
                </select>
              </div>
            )}

            {/* Delete node button */}
            <button
              onClick={() => deleteNode(selectedNode.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '8px', borderRadius: 'var(--radius)',
                border: '1px solid #fecaca', background: '#fef2f2',
                color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                marginTop: '8px', width: '100%',
                transition: 'all 120ms ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5' }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca' }}
            >
              <Trash2 size={14} /> Delete Node
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
