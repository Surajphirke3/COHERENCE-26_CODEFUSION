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
import { Save, Zap, Bot, Mail, Clock, GitFork, Tag, Flag, Loader2, ArrowLeft, ChevronRight, Play } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// ── Node palette configuration ──
const NODE_PALETTE = [
  { type: 'trigger', label: 'Trigger', icon: Zap, color: '#1A56DB' },
  { type: 'aiMessage', label: 'AI Message', icon: Bot, color: '#7C3AED' },
  { type: 'sendEmail', label: 'Send Email', icon: Mail, color: '#065F46' },
  { type: 'delay', label: 'Delay', icon: Clock, color: '#92400E' },
  { type: 'condition', label: 'Condition', icon: GitFork, color: '#991B1B' },
  { type: 'tagLead', label: 'Tag Lead', icon: Tag, color: '#1F2937' },
  { type: 'end', label: 'End', icon: Flag, color: '#374151' },
]

// ── Custom Node Component ──
function CustomNode({ data }: { data: any }) {
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
    }}>
      <Handle type="target" position={Position.Top} style={{ background: palette.color, width: 8, height: 8 }} />
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
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [executing, setExecuting] = useState(false)
  const [execOutputs, setExecOutputs] = useState<any>(null)

  // Load workflow
  useEffect(() => {
    if (id === 'new') {
      setLoading(false)
      return
    }
    fetch(`/api/workflows/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.workflow) {
          setWorkflowName(data.workflow.name || 'Untitled Workflow')
          const loadedNodes = (data.workflow.nodes || []).map((n: any) => ({
            id: n.id,
            type: 'custom',
            position: n.position || { x: 0, y: 0 },
            data: { label: n.data?.label || n.type, nodeType: n.type, ...n.data },
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
  }, [id, setNodes, setEdges])

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
        promptTemplate: type === 'aiMessage' ? 'Write a personalized cold email to {{firstName}} at {{company}}' : undefined,
        delayMinutes: type === 'delay' ? 60 : undefined,
        tag: type === 'tagLead' ? 'contacted' : undefined,
      },
    }
    setNodes(nds => [...nds, newNode])
  }, [nodes.length, setNodes])

  // Save workflow
  const handleSave = async () => {
    setSaving(true)
    try {
      const saveNodes = nodes.map(n => ({
        id: n.id,
        type: (n.data as any).nodeType || 'trigger',
        position: n.position,
        data: n.data,
      }))
      const saveEdges = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      }))

      if (id === 'new') {
        const res = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, nodes: saveNodes, edges: saveEdges }),
        })
        const result = await res.json()
        if (res.ok) {
          window.history.replaceState(null, '', `/outreach/workflows/${result.workflow._id}/builder`)
        }
      } else {
        await fetch(`/api/workflows/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, nodes: saveNodes, edges: saveEdges }),
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  // Execute workflow
  const handleExecute = async () => {
    if (id === 'new') {
      toast.error('Save the workflow first before executing')
      return
    }
    setExecuting(true)
    setExecOutputs(null)
    try {
      const res = await fetch(`/api/workflows/${id}/execute`, {
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

        <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px', padding: '0 4px' }}>
            Node Palette
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
        </div>

        <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%' }}
          >
            {saving ? (
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : saved ? (
              '✓ Saved!'
            ) : (
              <><Save size={14} /> Save Workflow</>
            )}
          </button>
          <button
            className="btn-primary"
            onClick={handleExecute}
            disabled={executing || id === 'new'}
            style={{
              width: '100%',
              background: executing ? undefined : '#059669',
            }}
          >
            {executing ? (
              <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Executing…</>
            ) : (
              <><Play size={14} /> Execute Workflow</>
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
            maxHeight: '200px',
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
          </div>
        </div>
      )}
    </div>
  )
}
