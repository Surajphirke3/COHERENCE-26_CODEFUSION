'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Check, X, Minus, ArrowRight, Sparkles, Zap,
  ClipboardList, MessageSquare, FileEdit, Brain, Shield, Globe, BarChart3, Users,
} from 'lucide-react'

/* ─── Competitors ─────────────────────────────────────────── */
const competitors = [
  { id: 'trello', name: 'Trello', color: '#0079BF', letter: 'T' },
  { id: 'notion', name: 'Notion', color: '#000000', letter: 'N' },
  { id: 'slack', name: 'Slack', color: '#4A154B', letter: 'S' },
  { id: 'asana', name: 'Asana', color: '#F06A6A', letter: 'A' },
  { id: 'jira', name: 'Jira', color: '#0052CC', letter: 'J' },
]

type Support = 'yes' | 'no' | 'partial' | 'paid'

interface Feature {
  name: string
  icon: React.ElementType
  chronos: Support
  trello: Support
  notion: Support
  slack: Support
  asana: Support
  jira: Support
}

const features: Feature[] = [
  { name: 'Kanban Boards', icon: ClipboardList, chronos: 'yes', trello: 'yes', notion: 'partial', slack: 'no', asana: 'yes', jira: 'yes' },
  { name: 'Real-time Chat', icon: MessageSquare, chronos: 'yes', trello: 'no', notion: 'no', slack: 'yes', asana: 'no', jira: 'no' },
  { name: 'Documentation', icon: FileEdit, chronos: 'yes', trello: 'no', notion: 'yes', slack: 'no', asana: 'no', jira: 'partial' },
  { name: 'AI Assistant', icon: Brain, chronos: 'yes', trello: 'no', notion: 'paid', slack: 'paid', asana: 'paid', jira: 'paid' },
  { name: 'Sprint Planning', icon: BarChart3, chronos: 'yes', trello: 'partial', notion: 'partial', slack: 'no', asana: 'yes', jira: 'yes' },
  { name: 'Team Management', icon: Users, chronos: 'yes', trello: 'partial', notion: 'yes', slack: 'yes', asana: 'yes', jira: 'yes' },
  { name: 'Auth & Security', icon: Shield, chronos: 'yes', trello: 'yes', notion: 'yes', slack: 'yes', asana: 'yes', jira: 'yes' },
  { name: 'All-in-One', icon: Zap, chronos: 'yes', trello: 'no', notion: 'partial', slack: 'no', asana: 'no', jira: 'no' },
]

/* ─── Status Cell ─────────────────────────────────────────── */
function StatusCell({ status, animate = false, delay = 0 }: { status: Support; animate?: boolean; delay?: number }) {
  const Wrapper = animate ? motion.div : 'div' as any

  const props = animate
    ? { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, transition: { delay, duration: 0.3 } }
    : {}

  switch (status) {
    case 'yes':
      return (
        <Wrapper {...props} className="w-7 h-7 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(34,197,94,0.15)' }}>
          <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
        </Wrapper>
      )
    case 'no':
      return (
        <Wrapper {...props} className="w-7 h-7 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <X className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
        </Wrapper>
      )
    case 'partial':
      return (
        <Wrapper {...props} className="w-7 h-7 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(245,158,11,0.12)' }}>
          <Minus className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
        </Wrapper>
      )
    case 'paid':
      return (
        <Wrapper {...props}>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
            $$$
          </span>
        </Wrapper>
      )
  }
}

/* ─── Main Section ────────────────────────────────────────── */
export function Testimonials() {
  const [selectedCompetitor, setSelectedCompetitor] = useState('trello')
  const [showAll, setShowAll] = useState(false)

  const activeComp = competitors.find(c => c.id === selectedCompetitor)!

  // Count features where Chronos wins
  const chronosWins = features.filter(f => {
    const chronosVal = f.chronos
    const compVal = f[selectedCompetitor as keyof Feature] as Support
    if (chronosVal === 'yes' && compVal !== 'yes') return true
    return false
  }).length

  return (
    <section id="compare" className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] -z-10" style={{ background: 'var(--l-glow-2)' }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-6"
            style={{ background: 'var(--l-badge-bg)', border: '1px solid var(--l-badge-border)', color: 'var(--l-text-secondary)' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Why Chronos
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ color: 'var(--l-text)' }}>
            One tool to replace them all
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--l-text-secondary)' }}>
            See how Chronos stacks up against the tools your team already uses.
          </p>
        </motion.div>

        {/* Competitor Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-10 flex-wrap"
        >
          <span className="text-xs font-medium mr-1" style={{ color: 'var(--l-text-muted)' }}>Compare with:</span>
          {competitors.map((comp) => {
            const isActive = selectedCompetitor === comp.id
            return (
              <button
                key={comp.id}
                onClick={() => setSelectedCompetitor(comp.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: isActive ? `${comp.color}20` : 'var(--l-badge-bg)',
                  border: isActive ? `1.5px solid ${comp.color}60` : '1.5px solid var(--l-border)',
                  color: isActive ? 'var(--l-text)' : 'var(--l-text-tertiary)',
                  boxShadow: isActive ? `0 0 15px ${comp.color}15` : 'none',
                }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: comp.color }}
                >
                  {comp.letter}
                </div>
                {comp.name}
              </button>
            )
          })}
        </motion.div>

        {/* Score Banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCompetitor}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-6 mb-8 p-5 rounded-2xl"
            style={{ background: 'var(--l-bg-card)', border: '1px solid var(--l-border)' }}
          >
            {/* Chronos */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <Zap className="w-5 h-5" style={{ color: '#6366f1' }} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--l-text)' }}>Chronos</div>
                <div className="text-[10px]" style={{ color: '#22c55e' }}>{features.filter(f => f.chronos === 'yes').length}/{features.length} features</div>
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--l-badge-bg)', color: 'var(--l-text-muted)' }}>
                VS
              </span>
              <span className="text-[10px] font-semibold" style={{ color: '#22c55e' }}>
                Chronos wins in {chronosWins} areas
              </span>
            </div>

            {/* Competitor */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: activeComp.color }}>
                {activeComp.letter}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--l-text)' }}>{activeComp.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--l-text-muted)' }}>
                  {features.filter(f => f[selectedCompetitor as keyof Feature] === 'yes').length}/{features.length} features
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--l-bg-card)', border: '1px solid var(--l-border)' }}
        >
          {/* Table Header */}
          <div
            className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_120px_120px] px-6 py-4"
            style={{ borderBottom: '1px solid var(--l-border)', background: 'var(--l-badge-bg)' }}
          >
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--l-text-muted)' }}>
              Feature
            </div>
            <div className="text-center">
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                Chronos
              </span>
            </div>
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={selectedCompetitor}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="text-xs font-bold px-2 py-0.5 rounded inline-block"
                  style={{ background: `${activeComp.color}20`, color: 'var(--l-text-secondary)' }}
                >
                  {activeComp.name}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Table Rows */}
          {features.map((feature, i) => {
            const Icon = feature.icon
            const compStatus = feature[selectedCompetitor as keyof Feature] as Support
            const chronosWinsHere = feature.chronos === 'yes' && compStatus !== 'yes'

            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_120px_120px] px-6 py-4 items-center transition-all duration-200"
                style={{
                  borderBottom: i < features.length - 1 ? '1px solid var(--l-border)' : 'none',
                  background: chronosWinsHere ? 'rgba(34,197,94,0.03)' : 'transparent',
                }}
              >
                {/* Feature name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--l-badge-bg)', border: '1px solid var(--l-border)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'var(--l-text-secondary)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--l-text)' }}>
                    {feature.name}
                  </span>
                  {chronosWinsHere && (
                    <span className="hidden md:inline text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                      WIN
                    </span>
                  )}
                </div>

                {/* Chronos status */}
                <div className="text-center">
                  <StatusCell status={feature.chronos} />
                </div>

                {/* Competitor status */}
                <div className="text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedCompetitor}-${feature.name}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <StatusCell status={compStatus} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
          {[
            { icon: Check, label: 'Included', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
            { icon: Minus, label: 'Partial', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
            { icon: X, label: 'Not available', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: item.bg }}>
                <item.icon className="w-3 h-3" style={{ color: item.color }} />
              </div>
              <span className="text-[11px]" style={{ color: 'var(--l-text-muted)' }}>{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>$$$</span>
            <span className="text-[11px]" style={{ color: 'var(--l-text-muted)' }}>Paid add-on</span>
          </div>
        </div>
      </div>
    </section>
  )
}
