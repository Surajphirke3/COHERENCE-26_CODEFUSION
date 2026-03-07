'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Shield, Wrench, TrendingUp, Users, BrainCircuit, Globe,
  X, Check, ArrowRight, Layers, MonitorSmartphone, AlertTriangle, Sparkles,
} from 'lucide-react'

/* ─── Problem/Solution Data ───────────────────────────────── */
const items = [
  {
    icon: Wrench,
    problem: 'Tool fragmentation',
    tagline: '4 tools → 1 platform',
    stat: '75%',
    statLabel: 'cost reduction',
    color: '#ef4444',
    solutionColor: '#22c55e',
    before: {
      title: 'Without Chronos',
      items: [
        { tool: 'Trello', cost: '$10/user/mo', status: 'Paid' },
        { tool: 'Notion', cost: '$8/user/mo', status: 'Paid' },
        { tool: 'Slack', cost: '$7.25/user/mo', status: 'Paid' },
        { tool: 'ChatGPT', cost: '$20/user/mo', status: 'Paid' },
      ],
      total: '$45.25/user/mo',
    },
    after: {
      title: 'With Chronos',
      items: [
        { feature: 'Project Management', included: true },
        { feature: 'Team Chat', included: true },
        { feature: 'Documentation', included: true },
        { feature: 'AI Assistant', included: true },
      ],
      total: 'One platform, one price',
    },
  },
  {
    icon: Users,
    problem: 'Communication silos',
    tagline: 'Context linked to everything',
    stat: '0',
    statLabel: 'lost messages',
    color: '#f97316',
    solutionColor: '#6366f1',
    before: {
      title: 'Without Chronos',
      items: [
        { tool: '#random', cost: 'No context', status: 'Lost' },
        { tool: '#general', cost: 'Mixed topics', status: 'Noisy' },
        { tool: 'DMs', cost: 'Not searchable', status: 'Siloed' },
        { tool: 'Email', cost: 'Delayed', status: 'Slow' },
      ],
      total: '"What channel was that in?"',
    },
    after: {
      title: 'With Chronos',
      items: [
        { feature: 'Messages linked to tasks', included: true },
        { feature: 'Project-scoped channels', included: true },
        { feature: 'Full-text search across all', included: true },
        { feature: 'Thread context preserved', included: true },
      ],
      total: 'Every message has context',
    },
  },
  {
    icon: TrendingUp,
    problem: 'No visibility into progress',
    tagline: 'Real-time dashboards',
    stat: '89%',
    statLabel: 'faster insights',
    color: '#f59e0b',
    solutionColor: '#10b981',
    before: {
      title: 'Without Chronos',
      items: [
        { tool: 'Standup meetings', cost: '30 min daily', status: 'Wasted' },
        { tool: 'Status emails', cost: 'Always outdated', status: 'Stale' },
        { tool: 'Spreadsheets', cost: 'Manual updates', status: 'Error-prone' },
        { tool: 'Asking teammates', cost: 'Interruptions', status: 'Blocked' },
      ],
      total: '"How far along are we?"',
    },
    after: {
      title: 'With Chronos',
      items: [
        { feature: 'Live sprint dashboards', included: true },
        { feature: 'Auto-updated progress bars', included: true },
        { feature: 'Team activity feeds', included: true },
        { feature: 'AI-generated summaries', included: true },
      ],
      total: 'Know at a glance — always',
    },
  },
  {
    icon: BrainCircuit,
    problem: 'Manual busywork',
    tagline: 'AI does the boring stuff',
    stat: '10+',
    statLabel: 'hrs saved/week',
    color: '#8b5cf6',
    solutionColor: '#f97316',
    before: {
      title: 'Without Chronos',
      items: [
        { tool: 'Writing task desc.', cost: '20 min each', status: 'Tedious' },
        { tool: 'Meeting notes', cost: '15 min per mtg', status: 'Manual' },
        { tool: 'Status reports', cost: '1 hour weekly', status: 'Boring' },
        { tool: 'Doc summaries', cost: '30 min each', status: 'Slow' },
      ],
      total: 'Hours wasted on repetition',
    },
    after: {
      title: 'With Chronos',
      items: [
        { feature: 'AI writes task descriptions', included: true },
        { feature: 'Auto meeting summaries', included: true },
        { feature: 'One-click status reports', included: true },
        { feature: 'Instant doc summaries', included: true },
      ],
      total: 'AI handles the busywork',
    },
  },
  {
    icon: Shield,
    problem: 'Security concerns',
    tagline: 'Enterprise-grade protection',
    stat: '100%',
    statLabel: 'encrypted',
    color: '#6366f1',
    solutionColor: '#22c55e',
    before: {
      title: 'Without Chronos',
      items: [
        { tool: 'Multiple logins', cost: 'Weak passwords', status: 'Risk' },
        { tool: 'Shared accounts', cost: 'No audit trail', status: 'Unsafe' },
        { tool: 'Free tier tools', cost: 'Data not yours', status: 'Warning' },
        { tool: 'Local files', cost: 'Not backed up', status: 'Danger' },
      ],
      total: 'Scattered and vulnerable',
    },
    after: {
      title: 'With Chronos',
      items: [
        { feature: 'JWT encrypted sessions', included: true },
        { feature: 'Bcrypt password hashing', included: true },
        { feature: 'Middleware route protection', included: true },
        { feature: 'Role-based access control', included: true },
      ],
      total: 'Bank-level security, built in',
    },
  },
  {
    icon: Globe,
    problem: 'Slow and clunky tools',
    tagline: 'Sub-100ms page loads',
    stat: '<100',
    statLabel: 'ms load time',
    color: '#ec4899',
    solutionColor: '#06b6d4',
    before: {
      title: 'Without Chronos',
      items: [
        { tool: 'Legacy apps', cost: '3-5s load times', status: 'Slow' },
        { tool: 'Electron bloat', cost: '2GB+ RAM', status: 'Heavy' },
        { tool: 'Janky UIs', cost: 'Frustrating', status: 'Old' },
        { tool: 'Constant refreshes', cost: 'Lost work', status: 'Broken' },
      ],
      total: 'Waiting > working',
    },
    after: {
      title: 'With Chronos',
      items: [
        { feature: 'Next.js 16 + Turbopack', included: true },
        { feature: 'Server components', included: true },
        { feature: 'Instant navigation', included: true },
        { feature: 'Native-feel interactions', included: true },
      ],
      total: 'Feels like a native app',
    },
  },
]

export function Solutions() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = items[activeIndex]

  return (
    <section id="solutions" className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px] -z-10" style={{ background: 'var(--l-glow-1)' }} />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] -z-10" style={{ background: 'var(--l-glow-2)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-6"
            style={{ background: 'var(--l-badge-bg)', border: '1px solid var(--l-badge-border)', color: 'var(--l-text-secondary)' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Solutions
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ color: 'var(--l-text)' }}>
            Problems we solve
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--l-text-secondary)' }}>
            Click each problem to see the before &amp; after — how Chronos transforms your workflow.
          </p>
        </motion.div>

        {/* ─── Interactive Layout ──────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Problem Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-[340px] flex-shrink-0"
          >
            <div className="space-y-2">
              {items.map((item, i) => {
                const Icon = item.icon
                const isActive = i === activeIndex
                return (
                  <button
                    key={item.problem}
                    onClick={() => setActiveIndex(i)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 cursor-pointer group"
                    style={{
                      background: isActive ? 'var(--l-bg-card)' : 'transparent',
                      border: isActive ? `1.5px solid ${item.color}40` : '1.5px solid transparent',
                      boxShadow: isActive ? `0 0 20px ${item.color}10` : 'none',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                      style={{
                        background: isActive ? `${item.color}20` : 'var(--l-badge-bg)',
                        border: `1px solid ${isActive ? `${item.color}40` : 'var(--l-border)'}`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: isActive ? item.color : 'var(--l-text-muted)' }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold truncate transition-colors"
                        style={{ color: isActive ? 'var(--l-text)' : 'var(--l-text-secondary)' }}
                      >
                        {item.problem}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: 'var(--l-text-muted)' }}>
                        {item.tagline}
                      </div>
                    </div>

                    {/* Active indicator */}
                    <div
                      className="w-1.5 h-8 rounded-full transition-all duration-300 flex-shrink-0"
                      style={{
                        background: isActive ? item.color : 'transparent',
                        opacity: isActive ? 1 : 0,
                      }}
                    />
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* RIGHT: Before/After Comparison */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                {/* Stat highlight */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="text-5xl lg:text-6xl font-black tracking-tight"
                    style={{ color: active.solutionColor }}
                  >
                    {active.stat}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--l-text)' }}>
                      {active.statLabel}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--l-text-muted)' }}>
                      with Chronos
                    </div>
                  </div>
                </div>

                {/* Before / After Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BEFORE */}
                  <div
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={{ background: 'var(--l-bg-card)', border: `1px solid ${active.color}25` }}
                  >
                    {/* Red accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: active.color }} />

                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${active.color}20` }}>
                        <X className="w-3.5 h-3.5" style={{ color: active.color }} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: active.color }}>
                        {active.before.title}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {active.before.items.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg"
                          style={{ border: '1px solid var(--l-border)' }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: active.color }} />
                          <span className="text-[12px] font-medium flex-1" style={{ color: 'var(--l-text-secondary)' }}>
                            {item.tool}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--l-text-muted)' }}>
                            {item.cost}
                          </span>
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                            style={{ background: `${active.color}15`, color: active.color }}
                          >
                            {item.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <div
                      className="mt-4 pt-3 text-[11px] font-medium text-center"
                      style={{ borderTop: '1px dashed var(--l-border)', color: active.color }}
                    >
                      ❌ {active.before.total}
                    </div>
                  </div>

                  {/* AFTER */}
                  <div
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={{ background: 'var(--l-bg-card)', border: `1px solid ${active.solutionColor}25` }}
                  >
                    {/* Green accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: active.solutionColor }} />

                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${active.solutionColor}20` }}>
                        <Check className="w-3.5 h-3.5" style={{ color: active.solutionColor }} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: active.solutionColor }}>
                        {active.after.title}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {active.after.items.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 + 0.15 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg"
                          style={{ border: `1px solid ${active.solutionColor}15`, background: `${active.solutionColor}05` }}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `${active.solutionColor}20` }}
                          >
                            <Check className="w-3 h-3" style={{ color: active.solutionColor }} />
                          </div>
                          <span className="text-[12px] font-medium" style={{ color: 'var(--l-text)' }}>
                            {item.feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <div
                      className="mt-4 pt-3 text-[11px] font-medium text-center"
                      style={{ borderTop: `1px dashed ${active.solutionColor}30`, color: active.solutionColor }}
                    >
                      ✅ {active.after.total}
                    </div>
                  </div>
                </div>

                {/* Transition arrow (between cards on mobile, overlay on desktop) */}
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 20 }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'var(--l-bg)', border: '2px solid var(--l-border)' }}>
                    <ArrowRight className="w-5 h-5" style={{ color: active.solutionColor }} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
