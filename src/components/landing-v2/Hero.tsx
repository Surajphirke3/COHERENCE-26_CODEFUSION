'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Play } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState, useCallback, useEffect } from 'react'
import {
  ClipboardList,
  MessageSquare,
  FileEdit,
  Brain,
  Zap,
  CheckCircle2,
  GripVertical,
  Maximize2,
  Minus,
  LayoutDashboard,
  Bot,
  Send,
  FolderKanban,
  TrendingUp,
  Users,
  Calendar,
  Search,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE WORKFLOW CANVAS
   ═══════════════════════════════════════════════════════════ */

interface WNode {
  id: string
  icon: React.ElementType
  title: string
  type: string
  accent: string
  accentBg: string
  accentBorder: string
  x: number
  y: number
}

const initialNodes: WNode[] = [
  { id: 'trigger', icon: Zap, title: 'New Project', type: 'Trigger', accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.12)', accentBorder: 'rgba(245,158,11,0.35)', x: 30, y: 30 },
  { id: 'plan', icon: ClipboardList, title: 'Create Tasks', type: 'Action', accent: '#6366f1', accentBg: 'rgba(99,102,241,0.12)', accentBorder: 'rgba(99,102,241,0.35)', x: 220, y: 30 },
  { id: 'chat', icon: MessageSquare, title: 'Notify Team', type: 'Action', accent: '#8b5cf6', accentBg: 'rgba(139,92,246,0.12)', accentBorder: 'rgba(139,92,246,0.35)', x: 410, y: 30 },
  { id: 'docs', icon: FileEdit, title: 'Gen Docs', type: 'Action', accent: '#10b981', accentBg: 'rgba(16,185,129,0.12)', accentBorder: 'rgba(16,185,129,0.35)', x: 120, y: 170 },
  { id: 'ai', icon: Brain, title: 'AI Summarize', type: 'AI', accent: '#f97316', accentBg: 'rgba(249,115,22,0.12)', accentBorder: 'rgba(249,115,22,0.35)', x: 320, y: 170 },
  { id: 'done', icon: CheckCircle2, title: 'Complete', type: 'Output', accent: '#22c55e', accentBg: 'rgba(34,197,94,0.12)', accentBorder: 'rgba(34,197,94,0.35)', x: 220, y: 310 },
]

const connections = [
  ['trigger', 'plan'],
  ['plan', 'chat'],
  ['plan', 'docs'],
  ['chat', 'ai'],
  ['docs', 'ai'],
  ['ai', 'done'],
]

const NODE_W = 150
const NODE_H = 72

function InteractiveWorkflowCanvas() {
  const [nodes, setNodes] = useState<WNode[]>(initialNodes)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Node drag start
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    e.preventDefault()
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    setDragging(nodeId)
    setSelectedNode(nodeId)
    setDragOffset({
      x: e.clientX - (node.x + pan.x),
      y: e.clientY - (node.y + pan.y),
    })
  }, [nodes, pan])

  // Canvas pan start
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (dragging) return
    setSelectedNode(null)
    setIsPanning(true)
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [dragging, pan])

  // Mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragging
            ? { ...n, x: e.clientX - dragOffset.x - pan.x, y: e.clientY - dragOffset.y - pan.y }
            : n
        )
      )
    } else if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
    }
  }, [dragging, dragOffset, isPanning, panStart, pan])

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setDragging(null)
    setIsPanning(false)
  }, [])

  // Reset canvas
  const resetCanvas = () => {
    setNodes(initialNodes)
    setPan({ x: 0, y: 0 })
  }

  // Get connection path between two nodes
  const getPath = (fromId: string, toId: string) => {
    const from = nodes.find((n) => n.id === fromId)
    const to = nodes.find((n) => n.id === toId)
    if (!from || !to) return ''

    const fX = from.x + NODE_W + pan.x
    const fY = from.y + NODE_H / 2 + pan.y
    const tX = to.x + pan.x
    const tY = to.y + NODE_H / 2 + pan.y

    const midX = (fX + tX) / 2
    return `M ${fX} ${fY} C ${midX} ${fY}, ${midX} ${tY}, ${tX} ${tY}`
  }

  // Get connection color
  const getConnectionColor = (fromId: string) => {
    const node = nodes.find((n) => n.id === fromId)
    return node?.accentBorder || 'var(--l-border-hover)'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full"
      style={{ maxWidth: '800px' }}
    >
      {/* Canvas container */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          border: '1px solid var(--l-border)',
          background: 'var(--l-bg-card)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Canvas header */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--l-border)', background: 'var(--l-badge-bg)' }}
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <span style={{ fontSize: '11px', color: 'var(--l-text-tertiary)', fontFamily: 'monospace' }}>
              workflow — project_setup.flow
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetCanvas}
              className="p-1 rounded transition-colors cursor-pointer"
              style={{ color: 'var(--l-text-tertiary)' }}
              title="Reset canvas"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <span
              className="px-2 py-0.5 rounded-full text-base font-semibold"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              ● Active
            </span>
          </div>
        </div>

        {/* Interactive Canvas Area */}
        <div
          ref={containerRef}
          className="relative select-none"
          style={{
            height: '420px',
            backgroundImage: `radial-gradient(circle, var(--l-border) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: `${pan.x % 20}px ${pan.y % 20}px`,
            cursor: dragging ? 'grabbing' : isPanning ? 'grabbing' : 'grab',
            overflow: 'hidden',
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* SVG Connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {connections.map(([from, to]) => (
              <g key={`${from}-${to}`}>
                {/* Shadow path */}
                <path
                  d={getPath(from, to)}
                  stroke={getConnectionColor(from)}
                  strokeWidth="2"
                  fill="none"
                  opacity="0.15"
                  strokeLinecap="round"
                  filter="blur(3px)"
                />
                {/* Main path */}
                <path
                  d={getPath(from, to)}
                  stroke={getConnectionColor(from)}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  fill="none"
                  opacity="0.6"
                  strokeLinecap="round"
                />
                {/* Animated dot */}
                <circle r="3" fill={getConnectionColor(from)} opacity="0.9">
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={getPath(from, to)}
                  />
                </circle>
              </g>
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = node.icon
            const isSelected = selectedNode === node.id
            const isDraggingThis = dragging === node.id

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                className="absolute group"
                style={{
                  left: node.x + pan.x,
                  top: node.y + pan.y,
                  width: NODE_W,
                  height: NODE_H,
                  zIndex: isDraggingThis ? 100 : isSelected ? 50 : 10,
                  cursor: isDraggingThis ? 'grabbing' : 'grab',
                  transition: isDraggingThis ? 'none' : 'box-shadow 0.2s ease',
                }}
              >
                <div
                  className="w-full h-full rounded-xl p-3 transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: 'var(--l-bg-card)',
                    border: isSelected
                      ? `2px solid ${node.accent}`
                      : `1.5px solid ${node.accentBorder}`,
                    boxShadow: isSelected
                      ? `0 0 20px ${node.accentBg}, 0 4px 12px rgba(0,0,0,0.15)`
                      : isDraggingThis
                      ? `0 8px 25px rgba(0,0,0,0.2)`
                      : `0 2px 8px rgba(0,0,0,0.08)`,
                  }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2.5px]"
                    style={{ background: node.accent }}
                  />

                  {/* Drag handle hint */}
                  <GripVertical
                    className="absolute top-2 right-2 w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity"
                    style={{ color: 'var(--l-text-tertiary)' }}
                  />

                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: node.accentBg, border: `1px solid ${node.accentBorder}` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: node.accent }} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-base font-semibold truncate"
                        style={{ color: 'var(--l-text)', lineHeight: 1.3 }}
                      >
                        {node.title}
                      </div>
                      <div
                        className="text-base font-medium uppercase tracking-wider"
                        style={{ color: node.accent }}
                      >
                        {node.type}
                      </div>
                    </div>
                  </div>

                  {/* Connection ports */}
                  <div
                    className="absolute top-1/2 -left-[5px] w-[10px] h-[10px] rounded-full border-2 -translate-y-1/2"
                    style={{ borderColor: node.accent, background: 'var(--l-bg, #090e23)' }}
                  />
                  <div
                    className="absolute top-1/2 -right-[5px] w-[10px] h-[10px] rounded-full border-2 -translate-y-1/2"
                    style={{ borderColor: node.accent, background: 'var(--l-bg, #090e23)' }}
                  />
                </div>
              </div>
            )
          })}

          {/* Canvas hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'var(--l-badge-bg)', border: '1px solid var(--l-border)', zIndex: 50 }}
          >
            <span className="text-base" style={{ color: 'var(--l-text-tertiary)' }}>
              🖱️ Drag nodes • Pan canvas
            </span>
          </motion.div>
        </div>
      </div>

      {/* Canvas glow */}
      <div
        className="absolute -inset-3 -z-10 rounded-3xl blur-2xl opacity-30"
        style={{ background: 'var(--l-glow-1)' }}
      />
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE DASHBOARD CARD
   ═══════════════════════════════════════════════════════════ */

type DashView = 'dashboard' | 'projects' | 'tasks' | 'messages' | 'docs' | 'ai'

const sidebarItems: { key: DashView; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'tasks', label: 'Tasks', icon: ClipboardList },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'docs', label: 'Docs', icon: FileEdit },
  { key: 'ai', label: 'AI Chat', icon: Bot },
]

const urlMap: Record<DashView, string> = {
  dashboard: 'chronos.app/dashboard',
  projects: 'chronos.app/projects',
  tasks: 'chronos.app/tasks',
  messages: 'chronos.app/messages',
  docs: 'chronos.app/docs',
  ai: 'chronos.app/ai',
}

/* ─── Dashboard View ──────────────────────────────── */
function DashboardView() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Projects', value: '12', change: '+2 this week', icon: FolderKanban, color: 'from-indigo-500/20 to-indigo-600/10', iconColor: '#6366f1' },
          { label: 'Completion Rate', value: '89%', change: '↑ 5% vs last month', icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-600/10', iconColor: '#10b981' },
          { label: 'Team Online', value: '6/8', change: '2 away', icon: Users, color: 'from-violet-500/20 to-violet-600/10', iconColor: '#8b5cf6' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-3 bg-gradient-to-br ${stat.color}`}
            style={{ border: '1px solid var(--l-border)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-4 h-4" style={{ color: stat.iconColor }} />
              <span className="text-base" style={{ color: 'var(--l-text-muted)' }}>{stat.change}</span>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--l-text)' }}>{stat.value}</div>
            <div className="text-base mt-0.5" style={{ color: 'var(--l-text-tertiary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-4 space-y-2.5" style={{ border: '1px solid var(--l-border)', background: 'var(--l-bg-card)' }}>
        <div className="text-base font-semibold" style={{ color: 'var(--l-text-secondary)' }}>Recent Activity</div>
        {[
          { text: 'Emily merged PR #142 — Auth flow refactor', time: '3m ago', dot: 'bg-emerald-500' },
          { text: 'Sprint 8 planning meeting at 2:00 PM', time: '1h ago', dot: 'bg-indigo-500' },
          { text: 'Marketing site redesign moved to Review', time: '2h ago', dot: 'bg-amber-500' },
          { text: 'Ravi uploaded API v2 documentation', time: '4h ago', dot: 'bg-violet-500' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.dot}`} />
            <span className="text-base flex-1 truncate" style={{ color: 'var(--l-text-secondary)' }}>{item.text}</span>
            <span className="text-base flex-shrink-0" style={{ color: 'var(--l-text-muted)' }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Projects View ───────────────────────────────── */
function ProjectsView() {
  const projects = [
    { name: 'E-Commerce Redesign', team: 'Design Team', progress: 78, status: 'In Progress', color: '#6366f1', tasks: '23/30' },
    { name: 'Mobile Banking App', team: 'Engineering', progress: 45, status: 'In Progress', color: '#8b5cf6', tasks: '15/34' },
    { name: 'Customer Onboarding Flow', team: 'Product', progress: 100, status: 'Completed', color: '#22c55e', tasks: '18/18' },
    { name: 'Internal Analytics Dashboard', team: 'Data Team', progress: 12, status: 'Just Started', color: '#f59e0b', tasks: '3/25' },
    { name: 'DevOps Pipeline Automation', team: 'Platform', progress: 62, status: 'In Review', color: '#f97316', tasks: '8/13' },
  ]
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-base font-semibold" style={{ color: 'var(--l-text-secondary)' }}>5 Active Projects</span>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: 'var(--l-badge-bg)', border: '1px solid var(--l-border)' }}>
          <Search className="w-3 h-3" style={{ color: 'var(--l-text-muted)' }} />
          <span className="text-base" style={{ color: 'var(--l-text-muted)' }}>Search...</span>
        </div>
      </div>
      {projects.map((p) => (
        <div
          key={p.name}
          className="rounded-lg p-3 transition-all cursor-pointer"
          style={{ border: '1px solid var(--l-border)', background: 'var(--l-bg-card)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-base font-semibold" style={{ color: 'var(--l-text)' }}>{p.name}</span>
            </div>
            <span
              className="text-base px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${p.color}20`, color: p.color, border: `1px solid ${p.color}30` }}
            >
              {p.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--l-border)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.color }} />
            </div>
            <span className="text-base" style={{ color: 'var(--l-text-muted)' }}>{p.tasks} tasks</span>
          </div>
          <div className="text-base mt-1.5" style={{ color: 'var(--l-text-muted)' }}>{p.team}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── Tasks View ──────────────────────────────────── */
function TasksView() {
  const columns = [
    {
      title: 'To Do',
      color: '#a8a8a0',
      tasks: [
        { title: 'Write unit tests for auth module', priority: 'Medium', assignee: 'RK' },
        { title: 'Design email templates', priority: 'Low', assignee: 'SJ' },
      ],
    },
    {
      title: 'In Progress',
      color: '#6366f1',
      tasks: [
        { title: 'Implement Stripe checkout flow', priority: 'High', assignee: 'DP' },
        { title: 'Optimize image loading pipeline', priority: 'Medium', assignee: 'EM' },
      ],
    },
    {
      title: 'Done',
      color: '#22c55e',
      tasks: [
        { title: 'Set up CI/CD with GitHub Actions', priority: 'High', assignee: 'RK' },
      ],
    },
  ]
  const priorityColor: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#a8a8a0' }

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {columns.map((col) => (
        <div key={col.title} className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
            <span className="text-base font-semibold" style={{ color: 'var(--l-text-secondary)' }}>{col.title}</span>
            <span className="text-base ml-auto" style={{ color: 'var(--l-text-muted)' }}>{col.tasks.length}</span>
          </div>
          <div className="space-y-2">
            {col.tasks.map((task, i) => (
              <div
                key={i}
                className="rounded-lg p-2.5 cursor-pointer transition-all"
                style={{ border: '1px solid var(--l-border)', background: 'var(--l-bg-card)', borderLeft: `3px solid ${col.color}` }}
              >
                <div className="text-base font-medium mb-1.5 leading-tight" style={{ color: 'var(--l-text)' }}>{task.title}</div>
                <div className="flex items-center justify-between">
                  <span className="text-base px-1.5 py-0.5 rounded" style={{ background: `${priorityColor[task.priority]}15`, color: priorityColor[task.priority] }}>
                    {task.priority}
                  </span>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-base font-bold"
                    style={{ background: 'var(--l-accent-muted)', color: 'var(--l-accent)' }}
                  >
                    {task.assignee}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Messages View ───────────────────────────────── */
function MessagesView() {
  const messages = [
    { name: 'Emily Zhang', msg: 'I just pushed the Stripe integration — can someone review PR #142?', time: '2:32 PM', avatar: 'EZ', color: '#6366f1', isMe: false },
    { name: 'You', msg: 'On it! I\'ll review after standup.', time: '2:34 PM', avatar: 'YO', color: '#10b981', isMe: true },
    { name: 'Ravi Kumar', msg: 'The API docs are updated for the new endpoints. Check /docs/api-v2', time: '2:38 PM', avatar: 'RK', color: '#f97316', isMe: false },
    { name: 'Sarah Johnson', msg: 'Sprint 8 retro moved to Thursday. Updated the calendar 📅', time: '2:45 PM', avatar: 'SJ', color: '#8b5cf6', isMe: false },
    { name: 'You', msg: 'Sounds good! I\'ll prep the retro notes.', time: '2:46 PM', avatar: 'YO', color: '#10b981', isMe: true },
  ]
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid var(--l-border)' }}>
        <span className="text-base font-semibold" style={{ color: 'var(--l-text)' }}># engineering-team</span>
        <span className="text-base ml-auto" style={{ color: 'var(--l-text-muted)' }}>5 members</span>
      </div>
      <div className="space-y-3 flex-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.isMe ? 'flex-row-reverse' : ''}`}>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
              style={{ background: m.color }}
            >
              {m.avatar}
            </div>
            <div className={`max-w-[75%] ${m.isMe ? 'text-right' : ''}`}>
              <div className="flex items-center gap-1.5 mb-0.5" style={{ flexDirection: m.isMe ? 'row-reverse' : 'row' }}>
                <span className="text-base font-semibold" style={{ color: 'var(--l-text)' }}>{m.name}</span>
                <span className="text-base" style={{ color: 'var(--l-text-muted)' }}>{m.time}</span>
              </div>
              <div
                className="text-base px-2.5 py-1.5 rounded-lg inline-block leading-relaxed"
                style={{
                  background: m.isMe ? 'var(--l-accent-muted)' : 'var(--l-bg-card)',
                  border: `1px solid ${m.isMe ? 'var(--l-accent)' : 'var(--l-border)'}`,
                  color: 'var(--l-text-secondary)',
                  textAlign: 'left',
                }}
              >
                {m.msg}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--l-badge-bg)', border: '1px solid var(--l-border)' }}>
        <span className="text-base flex-1" style={{ color: 'var(--l-text-muted)' }}>Type a message…</span>
        <Send className="w-3.5 h-3.5" style={{ color: 'var(--l-text-muted)' }} />
      </div>
    </div>
  )
}

/* ─── Docs View ───────────────────────────────────── */
function DocsView() {
  const docs = [
    { title: 'API v2 Reference', updated: '3h ago', author: 'Ravi', pages: 24, icon: '📘' },
    { title: 'Sprint 8 Planning Notes', updated: 'Today', author: 'Sarah', pages: 3, icon: '📋' },
    { title: 'E-Commerce Architecture', updated: 'Yesterday', author: 'Emily', pages: 12, icon: '🏗️' },
    { title: 'Onboarding Checklist', updated: '2 days ago', author: 'Daniel', pages: 5, icon: '✅' },
    { title: 'Brand Guidelines 2026', updated: 'Last week', author: 'Sarah', pages: 18, icon: '🎨' },
  ]
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-base font-semibold" style={{ color: 'var(--l-text-secondary)' }}>Team Docs</span>
        <span className="text-base" style={{ color: 'var(--l-text-muted)' }}>5 documents</span>
      </div>
      {docs.map((d) => (
        <div
          key={d.title}
          className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all"
          style={{ border: '1px solid var(--l-border)', background: 'var(--l-bg-card)' }}
        >
          <span className="text-base">{d.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold truncate" style={{ color: 'var(--l-text)' }}>{d.title}</div>
            <div className="text-base" style={{ color: 'var(--l-text-muted)' }}>Edited {d.updated} by {d.author} · {d.pages} pages</div>
          </div>
          <FileEdit className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--l-text-muted)' }} />
        </div>
      ))}
    </div>
  )
}

/* ─── AI Chat View ────────────────────────────────── */
function AIChatView() {
  const conversation = [
    { role: 'user' as const, text: 'Summarize the progress of our E-Commerce Redesign project.' },
    { role: 'ai' as const, text: 'The E-Commerce Redesign is 78% complete with 23 of 30 tasks done. Key wins this sprint: Stripe integration merged, product page responsive design finished. Blockers: checkout accessibility audit pending, needs QA sign-off on mobile flows.' },
    { role: 'user' as const, text: 'What should we prioritize for next week?' },
    { role: 'ai' as const, text: 'Based on your sprint velocity and remaining backlog, I recommend:\n\n1. Complete checkout accessibility audit (blocker for launch)\n2. QA mobile payment flows (3 test cases remaining)\n3. Start performance optimization for product listing pages\n\nEstimated completion: 8-10 business days at current pace.' },
  ]
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid var(--l-border)' }}>
        <Bot className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
        <span className="text-base font-semibold" style={{ color: 'var(--l-text)' }}>Chronos AI</span>
        <span className="text-base px-1.5 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>Powered by Groq</span>
      </div>
      <div className="space-y-3 flex-1">
        {conversation.map((m, i) => (
          <div key={i}>
            <div className="flex items-center gap-1.5 mb-1">
              {m.role === 'ai' ? (
                <Bot className="w-3 h-3" style={{ color: '#f97316' }} />
              ) : (
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
              )}
              <span className="text-base font-semibold" style={{ color: 'var(--l-text-secondary)' }}>
                {m.role === 'ai' ? 'Chronos AI' : 'You'}
              </span>
            </div>
            <div
              className="text-base px-3 py-2 rounded-lg leading-relaxed whitespace-pre-line"
              style={{
                background: m.role === 'ai' ? 'rgba(249,115,22,0.08)' : 'var(--l-bg-card)',
                border: `1px solid ${m.role === 'ai' ? 'rgba(249,115,22,0.2)' : 'var(--l-border)'}`,
                color: 'var(--l-text-secondary)',
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--l-badge-bg)', border: '1px solid var(--l-border)' }}>
        <Bot className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
        <span className="text-base flex-1" style={{ color: 'var(--l-text-muted)' }}>Ask Chronos AI anything…</span>
        <Send className="w-3.5 h-3.5" style={{ color: 'var(--l-text-muted)' }} />
      </div>
    </div>
  )
}

/* ─── View Router ─────────────────────────────────── */
function DashContent({ view }: { view: DashView }) {
  switch (view) {
    case 'dashboard': return <DashboardView />
    case 'projects': return <ProjectsView />
    case 'tasks': return <TasksView />
    case 'messages': return <MessagesView />
    case 'docs': return <DocsView />
    case 'ai': return <AIChatView />
  }
}

function FloatingCard() {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mx = useSpring(x, { stiffness: 200, damping: 25 })
  const my = useSpring(y, { stiffness: 200, damping: 25 })

  const rX = useTransform(my, [-0.5, 0.5], ['8deg', '-8deg'])
  const rY = useTransform(mx, [-0.5, 0.5], ['-8deg', '8deg'])

  const [activeView, setActiveView] = useState<DashView>('dashboard')

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      initial={{ opacity: 0, y: 80, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
      className="mt-24 lg:mt-32 relative mx-auto max-w-7xl"
      style={{ perspective: 2000 }}
    >
      {/* Glow */}
      <div
        className="absolute -inset-4 rounded-3xl blur-3xl opacity-40 animate-pulse"
        style={{ background: 'linear-gradient(to right, var(--l-glow-1), var(--l-glow-2), var(--l-glow-1))' }}
      />

      <motion.div
        style={{ rotateX: rX, rotateY: rY, transformStyle: 'preserve-3d' }}
        className="relative w-full rounded-2xl backdrop-blur-2xl shadow-2xl overflow-hidden"
      >
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{ background: 'var(--l-bg-card)', border: '1px solid var(--l-border)' }}
        >
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid var(--l-border)', background: 'var(--l-badge-bg)' }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md text-base font-mono transition-all" style={{ background: 'var(--l-badge-bg)', color: 'var(--l-text-tertiary)' }}>
                {urlMap[activeView]}
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-4 flex gap-4 min-h-[460px] lg:min-h-[580px]" style={{ transform: 'translateZ(40px)' }}>
            {/* Sidebar */}
            <div className="hidden md:flex flex-col gap-1 w-64 pr-3 flex-shrink-0" style={{ borderRight: '1px solid var(--l-border)' }}>
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveView(item.key)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-base transition-all text-left cursor-pointer"
                    style={{
                      background: isActive ? 'var(--l-accent-muted)' : 'transparent',
                      color: isActive ? 'var(--l-accent)' : 'var(--l-text-tertiary)',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )
              })}

              {/* Mini stats in sidebar */}
              <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--l-border)' }}>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--l-badge-bg)' }}>
                  <div className="text-base uppercase tracking-wider mb-1" style={{ color: 'var(--l-text-muted)' }}>Sprint 8</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--l-border)' }}>
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: '65%' }} />
                    </div>
                    <span className="text-base font-semibold" style={{ color: 'var(--l-text-secondary)' }}>65%</span>
                  </div>
                  <div className="text-base mt-1" style={{ color: 'var(--l-text-muted)' }}>4 days remaining</div>
                </div>
              </div>
            </div>

            {/* Mobile tabs */}
            <div className="md:hidden flex gap-1 overflow-x-auto pb-2 mb-2 -mx-1 px-1" style={{ borderBottom: '1px solid var(--l-border)' }}>
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveView(item.key)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-base whitespace-nowrap transition-all cursor-pointer"
                    style={{
                      background: activeView === item.key ? 'var(--l-accent-muted)' : 'transparent',
                      color: activeView === item.key ? 'var(--l-accent)' : 'var(--l-text-tertiary)',
                      fontWeight: activeView === item.key ? 600 : 400,
                    }}
                  >
                    <Icon className="w-3 h-3" />
                    {item.label}
                  </button>
                )
              })}
            </div>

            {/* Main Content — Animated view switching */}
            <div className="flex-1 overflow-hidden">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DashContent view={activeView} />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive hint */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.5 }}
        className="text-center mt-4 text-base"
        style={{ color: 'var(--l-text-muted)' }}
      >
        👆 Click sidebar items to explore the dashboard
      </motion.p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════ */

export function Hero() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: i * 0.15, ease: 'easeOut' },
    }),
  }

  return (
    <section className="relative pt-20 lg:pt-24 pb-10 lg:pt-24 lg:pb-16 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--l-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--l-border)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Animated Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-[10%] w-[600px] h-[600px] rounded-full blur-[160px] -z-10"
        style={{ background: 'var(--l-glow-1)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-[10%] w-[500px] h-[500px] rounded-full blur-[140px] -z-10"
        style={{ background: 'var(--l-glow-2)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* ─── Split Layout: Brand + Workflow ────────── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* LEFT: Brand Content */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium mb-8 backdrop-blur-md"
              style={{ background: 'var(--l-badge-bg)', border: '1px solid var(--l-badge-border)', color: 'var(--l-text-secondary)' }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Chronos 2.0 — Now with AI Workflows</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
              style={{ color: 'var(--l-text)' }}
            >
              Your startup&apos;s
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 animate-gradient-x">
                operating system
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-base md:text-lg mb-10 leading-relaxed"
              style={{ color: 'var(--l-text-secondary)' }}
            >
              Stop juggling Trello, Notion, Slack and ChatGPT. Chronos unifies project management,
              real-time chat, documentation, and AI — in one beautiful workspace.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
            >
              <Link
                href="/login"
                className="group relative w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold rounded-full transition-all shadow-lg overflow-hidden"
                style={{ background: 'var(--l-accent)', color: 'var(--l-bg)' }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start building free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
              <a
                href="#workflow"
                className="group w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold rounded-full transition-all backdrop-blur-sm"
                style={{ background: 'var(--l-badge-bg)', border: '1px solid var(--l-border)', color: 'var(--l-text)' }}
              >
                <Play className="w-4 h-4" style={{ color: 'var(--l-text-secondary)' }} />
                Watch demo
              </a>
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-10 hidden lg:block"
            >
              <p className="text-base uppercase tracking-widest mb-3" style={{ color: 'var(--l-text-muted)' }}></p>
              <div className="flex items-center gap-6 opacity-40">
                {[].map((name) => (
                  <span key={name} className="text-base font-bold tracking-wide" style={{ color: 'var(--l-text-secondary)' }}>
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Interactive Workflow Canvas */}
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            <InteractiveWorkflowCanvas />
          </div>
        </div>

        {/* ─── Dashboard Preview (below hero) ────────── */}
        <FloatingCard />

        {/* Trust Badges (mobile) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-16 text-center lg:hidden"
        >
          <p className="text-base uppercase tracking-widest mb-4" style={{ color: 'var(--l-text-muted)' }}>Trusted by teams at</p>
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-40">
            {['TechStart', 'InnovateCo', 'LaunchPad', 'BuildFast', 'ScaleUp'].map((name) => (
              <span key={name} className="text-lg font-bold tracking-wide" style={{ color: 'var(--l-text-secondary)' }}>
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
