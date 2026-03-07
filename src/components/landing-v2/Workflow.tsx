'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ClipboardList, MessageSquare, FileEdit, Brain, ArrowRight, ArrowDown, Zap, CheckCircle2, ChevronDown } from 'lucide-react'

/* ─── Step Data ───────────────────────────────────────────── */
const steps = [
  {
    id: 'trigger',
    step: 1,
    icon: Zap,
    badge: 'Trigger',
    heading: 'New project kicks it off',
    description: 'Create a project and the entire workflow fires automatically — just like n8n or Zapier.',
    detail: 'Supports manual, scheduled, or webhook-based triggers. Chain multiple workflows together for complex automations.',
    accent: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.10)',
    accentBorder: 'rgba(245, 158, 11, 0.25)',
  },
  {
    id: 'plan',
    step: 2,
    icon: ClipboardList,
    badge: 'Plan',
    heading: 'Tasks & boards created',
    description: 'Kanban boards, sprint milestones, and task breakdowns are generated instantly from templates.',
    detail: 'Auto-assign team members based on roles. Set priorities, deadlines, and dependencies with smart defaults.',
    accent: '#6366f1',
    accentBg: 'rgba(99, 102, 241, 0.10)',
    accentBorder: 'rgba(99, 102, 241, 0.25)',
  },
  {
    id: 'notify',
    step: 3,
    icon: MessageSquare,
    badge: 'Notify',
    heading: 'Team notified in real-time',
    description: 'Channels auto-created, teammates get DMs, and all context is linked to the project.',
    detail: 'Integrates with email, push notifications, and in-app alerts. No more lost Slack threads.',
    accent: '#8b5cf6',
    accentBg: 'rgba(139, 92, 246, 0.10)',
    accentBorder: 'rgba(139, 92, 246, 0.25)',
  },
  {
    id: 'docs',
    step: 4,
    icon: FileEdit,
    badge: 'Document',
    heading: 'Docs generated automatically',
    description: 'Project specs, API docs, and meeting templates appear in your workspace — all collaborative.',
    detail: 'Powered by Tiptap editor. Real-time collaboration with version history and commenting built in.',
    accent: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.10)',
    accentBorder: 'rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'ai',
    step: 5,
    icon: Brain,
    badge: 'AI',
    heading: 'AI summarizes & suggests',
    description: 'Groq-powered AI analyzes project context, writes descriptions, and suggests next steps.',
    detail: 'Ask questions in natural language. Get instant answers about any data in your workspace.',
    accent: '#f97316',
    accentBg: 'rgba(249, 115, 22, 0.10)',
    accentBorder: 'rgba(249, 115, 22, 0.25)',
  },
  {
    id: 'done',
    step: 6,
    icon: CheckCircle2,
    badge: 'Complete',
    heading: 'Project ready, team aligned',
    description: 'In minutes, your project is fully set up — tasks, channels, docs, and AI context all ready to go.',
    detail: 'Team can start shipping immediately. Full audit trail of every automated setup action taken.',
    accent: '#22c55e',
    accentBg: 'rgba(34, 197, 94, 0.10)',
    accentBorder: 'rgba(34, 197, 94, 0.25)',
  },
]

/* ─── Animated Arrow ──────────────────────────────────────── */
function FlowArrow({ color, direction = 'right', delay = 0 }: { color: string; direction?: 'right' | 'down'; delay?: number }) {
  const isDown = direction === 'down'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={`flex items-center justify-center flex-shrink-0 ${isDown ? 'py-4' : 'px-1'}`}
    >
      <div className={`relative flex ${isDown ? 'flex-col items-center' : 'items-center'}`}>
        {/* Dashed line */}
        <div
          style={{
            width: isDown ? '2px' : '40px',
            height: isDown ? '40px' : '2px',
            backgroundImage: isDown
              ? `linear-gradient(to bottom, ${color} 50%, transparent 50%)`
              : `linear-gradient(to right, ${color} 50%, transparent 50%)`,
            backgroundSize: isDown ? '2px 8px' : '8px 2px',
            opacity: 0.5,
          }}
        />
        {/* Arrow circle */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: `${color}15`,
            border: `1.5px solid ${color}40`,
          }}
        >
          {isDown ? (
            <ArrowDown className="w-3.5 h-3.5" style={{ color }} />
          ) : (
            <ArrowRight className="w-3.5 h-3.5" style={{ color }} />
          )}
          {/* Ping animation */}
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: `${color}10`, animationDuration: '3s' }}
          />
        </div>
        {/* Dashed line */}
        <div
          style={{
            width: isDown ? '2px' : '40px',
            height: isDown ? '40px' : '2px',
            backgroundImage: isDown
              ? `linear-gradient(to bottom, ${color} 50%, transparent 50%)`
              : `linear-gradient(to right, ${color} 50%, transparent 50%)`,
            backgroundSize: isDown ? '2px 8px' : '8px 2px',
            opacity: 0.5,
          }}
        />
      </div>
    </motion.div>
  )
}

/* ─── Step Card ───────────────────────────────────────────── */
function StepCard({ step, index, isSelected, onSelect }: {
  step: typeof steps[0]
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  const Icon = step.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onClick={onSelect}
      className="group relative w-full max-w-sm rounded-2xl backdrop-blur-sm transition-all duration-300 overflow-hidden cursor-pointer"
      style={{
        background: 'var(--l-bg-card)',
        border: isSelected ? `2px solid ${step.accent}` : '1px solid var(--l-border)',
        boxShadow: isSelected
          ? `0 0 30px ${step.accentBg}, 0 8px 24px rgba(0,0,0,0.12)`
          : 'none',
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-[3px]"
        style={{ background: `linear-gradient(to right, ${step.accent}, ${step.accent}40)` }}
      />

      <div className="p-6">
        {/* Header row: badge + step number */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all"
            style={{
              background: isSelected ? step.accent : step.accentBg,
              color: isSelected ? 'white' : step.accent,
              border: `1px solid ${step.accentBorder}`,
            }}
          >
            {step.badge}
          </span>
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded"
            style={{ color: 'var(--l-text-muted)', background: 'var(--l-badge-bg)' }}
          >
            Step {step.step}
          </span>
        </div>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
          style={{ background: step.accentBg, border: `1px solid ${step.accentBorder}` }}
        >
          <Icon className="w-7 h-7" style={{ color: step.accent }} />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--l-text)' }}>
          {step.heading}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--l-text-secondary)' }}>
          {step.description}
        </p>

        {/* Expandable detail */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4" style={{ borderTop: `1px dashed ${step.accentBorder}` }}>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--l-text-tertiary)' }}>
                  💡 {step.detail}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click hint */}
        <div className="flex items-center gap-1 mt-4">
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-300"
            style={{
              color: step.accent,
              transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
          <span className="text-[10px]" style={{ color: 'var(--l-text-muted)' }}>
            {isSelected ? 'Click to collapse' : 'Click for details'}
          </span>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-3xl"
        style={{ background: step.accentBg }}
      />
    </motion.div>
  )
}

/* ─── Main Workflow Section ───────────────────────────────── */
export function Workflow() {
  const [selectedStep, setSelectedStep] = useState<string | null>(null)

  const row1 = steps.slice(0, 3)
  const row2 = steps.slice(3, 6)

  return (
    <section id="workflow" className="relative py-32 overflow-hidden">
      {/* Dotted grid background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle, var(--l-border) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          opacity: 0.35,
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[220px] -z-10" style={{ background: 'var(--l-glow-2)' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-6"
            style={{ background: 'var(--l-badge-bg)', border: '1px solid var(--l-badge-border)', color: 'var(--l-text-secondary)' }}
          >
            <Zap className="w-3.5 h-3.5" />
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ color: 'var(--l-text)' }}>
            Every step, automated
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--l-text-secondary)' }}>
            Here&apos;s what happens behind the scenes when your team starts a new project in Chronos.
          </p>
        </motion.div>

        {/* ─── Desktop Flow ────────────────────────────────── */}
        <div className="hidden lg:block">
          {/* Row 1 — three cards with arrows between */}
          <div className="flex items-stretch justify-center gap-0">
            <StepCard
              step={row1[0]}
              index={0}
              isSelected={selectedStep === row1[0].id}
              onSelect={() => setSelectedStep(selectedStep === row1[0].id ? null : row1[0].id)}
            />
            <FlowArrow color={row1[0].accent} delay={0.3} />
            <StepCard
              step={row1[1]}
              index={1}
              isSelected={selectedStep === row1[1].id}
              onSelect={() => setSelectedStep(selectedStep === row1[1].id ? null : row1[1].id)}
            />
            <FlowArrow color={row1[1].accent} delay={0.4} />
            <StepCard
              step={row1[2]}
              index={2}
              isSelected={selectedStep === row1[2].id}
              onSelect={() => setSelectedStep(selectedStep === row1[2].id ? null : row1[2].id)}
            />
          </div>

          {/* Row connector — centered down arrow */}
          <div className="flex justify-center">
            <FlowArrow color="#8b5cf6" direction="down" delay={0.5} />
          </div>

          {/* Row 2 — three cards with arrows between */}
          <div className="flex items-stretch justify-center gap-0">
            <StepCard
              step={row2[0]}
              index={3}
              isSelected={selectedStep === row2[0].id}
              onSelect={() => setSelectedStep(selectedStep === row2[0].id ? null : row2[0].id)}
            />
            <FlowArrow color={row2[0].accent} delay={0.6} />
            <StepCard
              step={row2[1]}
              index={4}
              isSelected={selectedStep === row2[1].id}
              onSelect={() => setSelectedStep(selectedStep === row2[1].id ? null : row2[1].id)}
            />
            <FlowArrow color={row2[1].accent} delay={0.7} />
            <StepCard
              step={row2[2]}
              index={5}
              isSelected={selectedStep === row2[2].id}
              onSelect={() => setSelectedStep(selectedStep === row2[2].id ? null : row2[2].id)}
            />
          </div>
        </div>

        {/* ─── Tablet Flow (2 col) ─────────────────────────── */}
        <div className="hidden md:block lg:hidden">
          <div className="grid grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <div key={step.id} className="flex flex-col items-center">
                <StepCard
                  step={step}
                  index={i}
                  isSelected={selectedStep === step.id}
                  onSelect={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                />
                {i < steps.length - 1 && i % 2 === 1 && (
                  <FlowArrow color={step.accent} direction="down" delay={0.3} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Mobile Flow (vertical) ──────────────────────── */}
        <div className="md:hidden space-y-0">
          {steps.map((step, i) => (
            <div key={step.id} className="flex flex-col items-center">
              <StepCard
                step={step}
                index={i}
                isSelected={selectedStep === step.id}
                onSelect={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
              />
              {i < steps.length - 1 && (
                <FlowArrow color={step.accent} direction="down" delay={0.2 + i * 0.1} />
              )}
            </div>
          ))}
        </div>


      </div>
    </section>
  )
}
