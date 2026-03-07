'use client'

import { motion } from 'framer-motion'
import { ClipboardList, MessageSquare, FileEdit, Brain, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    icon: Zap,
    title: 'Trigger',
    heading: 'New project kicks it off',
    description: 'Just like n8n or Zapier, everything starts with a trigger. When a new project is created, Chronos automatically fires the workflow.',
    accent: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.10)',
    accentBorder: 'rgba(245, 158, 11, 0.25)',
  },
  {
    icon: ClipboardList,
    title: 'Plan',
    heading: 'Tasks & boards auto-created',
    description: 'Kanban boards, sprint milestones, and task breakdowns are generated instantly. Assign team members and set deadlines in one click.',
    accent: '#6366f1',
    accentBg: 'rgba(99, 102, 241, 0.10)',
    accentBorder: 'rgba(99, 102, 241, 0.25)',
  },
  {
    icon: MessageSquare,
    title: 'Notify',
    heading: 'Team gets notified in real-time',
    description: 'Channels are auto-created, teammates get DMs, and context is linked to the project — no more lost Slack threads.',
    accent: '#8b5cf6',
    accentBg: 'rgba(139, 92, 246, 0.10)',
    accentBorder: 'rgba(139, 92, 246, 0.25)',
  },
  {
    icon: FileEdit,
    title: 'Document',
    heading: 'Docs generated automatically',
    description: 'Project specs, API docs, and meeting templates appear in your workspace. All linked, all collaborative, all auto-saved.',
    accent: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.10)',
    accentBorder: 'rgba(16, 185, 129, 0.25)',
  },
  {
    icon: Brain,
    title: 'AI',
    heading: 'AI summarizes & suggests',
    description: 'Groq-powered AI analyzes your project context, writes task descriptions, generates summaries, and suggests next actions.',
    accent: '#f97316',
    accentBg: 'rgba(249, 115, 22, 0.10)',
    accentBorder: 'rgba(249, 115, 22, 0.25)',
  },
  {
    icon: CheckCircle2,
    title: 'Done',
    heading: 'Project ready, team aligned',
    description: 'In minutes, your project is set up with tasks, channels, docs, and AI context — the team can start shipping immediately.',
    accent: '#22c55e',
    accentBg: 'rgba(34, 197, 94, 0.10)',
    accentBorder: 'rgba(34, 197, 94, 0.25)',
  },
]

export function Workflow() {
  return (
    <section id="workflow" className="relative py-32 overflow-hidden">
      {/* Dotted grid background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle, var(--l-border) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          opacity: 0.4,
        }}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] -z-10" style={{ background: 'var(--l-glow-2)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* ─── Step Cards (n8n node style) ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group relative rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 overflow-hidden"
                style={{
                  background: 'var(--l-bg-card)',
                  border: `1px solid var(--l-border)`,
                }}
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                  style={{ background: step.accent }}
                />

                {/* Header: Badge + connection dots */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: step.accentBg, color: step.accent, border: `1px solid ${step.accentBorder}` }}
                  >
                    {step.title}
                  </span>

                  {/* Connection ports */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: step.accentBorder }} />
                    <div className="w-6 h-0.5 rounded-full" style={{ background: step.accentBorder }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: step.accent }} />
                  </div>
                </div>

                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-sm"
                  style={{ background: step.accentBg, border: `1px solid ${step.accentBorder}` }}
                >
                  <Icon className="w-5 h-5" style={{ color: step.accent }} />
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--l-text)' }}>
                  {step.heading}
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--l-text-secondary)' }}>
                  {step.description}
                </p>

                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-2xl"
                  style={{ background: step.accentBg }}
                />
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 flex justify-center"
        >
          <a
            href="#features"
            className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full transition-all"
            style={{
              background: 'var(--l-badge-bg)',
              border: '1px solid var(--l-border)',
              color: 'var(--l-text)',
            }}
          >
            Explore all features
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
