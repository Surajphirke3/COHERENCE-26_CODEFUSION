'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Layers, Clock, MessageSquareX, CalendarX, TrendingDown, AlertTriangle } from 'lucide-react'

/* ─── Progress Ring ───────────────────────────────────────── */
function ProgressRing({ value, color, size = 52 }: { value: number; color: string; size?: number }) {
  const r = (size - 6) / 2
  const circumference = 2 * Math.PI * r

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--l-border)" strokeWidth="4" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        whileInView={{ strokeDashoffset: circumference - (value / 100) * circumference }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
      />
    </svg>
  )
}

/* ─── Mini Bar Chart ──────────────────────────────────────── */
function MiniBarChart({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data)
  const barW = 8
  const gap = 4

  return (
    <svg width={data.length * (barW + gap)} height={height}>
      {data.map((v, i) => {
        const barH = (v / max) * (height - 4)
        return (
          <motion.rect
            key={i}
            x={i * (barW + gap)}
            y={height - barH}
            width={barW}
            height={barH}
            rx={3}
            fill={color}
            opacity={0.15 + (v / max) * 0.85}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
            style={{ transformOrigin: 'bottom' }}
          />
        )
      })}
    </svg>
  )
}

/* ─── Problem Stats Data ──────────────────────────────────── */
const problems = [
  {
    icon: Layers,
    value: '5+',
    label: 'Tools used by avg team',
    description: 'Teams juggle Trello, Notion, Slack, Jira, and ChatGPT daily — paying for each one separately.',
    source: 'Gartner 2025',
    color: '#ef4444',
    ringValue: 73,
    ringLabel: '73% of teams',
    visual: 'ring' as const,
  },
  {
    icon: Clock,
    value: '2.5h',
    label: 'Lost daily to context-switching',
    description: 'Developers lose 2.5 hours every day switching between disconnected tools and hunting for information.',
    source: 'Atlassian Research',
    color: '#f59e0b',
    barData: [6, 8, 7, 9, 10, 8, 9, 10],
    visual: 'bars' as const,
  },
  {
    icon: MessageSquareX,
    value: '60%',
    label: 'Decisions lost in chat',
    description: 'Critical project decisions buried in Slack threads that nobody can find two weeks later.',
    source: 'Harvard Business Review',
    color: '#8b5cf6',
    ringValue: 60,
    ringLabel: 'of decisions',
    visual: 'ring' as const,
  },
  {
    icon: CalendarX,
    value: '45%',
    label: 'Projects miss deadlines',
    description: 'Nearly half of software projects ship late due to poor visibility into progress and blockers.',
    source: 'PMI Pulse of Profession',
    color: '#6366f1',
    barData: [4, 5, 7, 6, 8, 9, 7, 10],
    visual: 'bars' as const,
  },
]

/* ─── Main Stats Section ──────────────────────────────────── */
export function Stats() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10" style={{ background: 'var(--l-glow-1)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-6"
            style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            The Problem
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--l-text)' }}>
            Your team is wasting time
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--l-text-secondary)' }}>
            Fragmented tools kill productivity. Here&apos;s what the research says about teams like yours.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group relative rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 overflow-hidden cursor-default"
                style={{
                  background: 'var(--l-bg-card)',
                  border: '1px solid var(--l-border)',
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: stat.color }}
                />

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <TrendingDown className="w-4 h-4" style={{ color: stat.color, opacity: 0.5 }} />
                </div>

                {/* Value */}
                <div className="text-3xl font-bold mb-1 tracking-tight" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-[11px] font-semibold mb-2" style={{ color: 'var(--l-text)' }}>{stat.label}</div>
                <p className="text-[11px] leading-relaxed mb-4" style={{ color: 'var(--l-text-tertiary)' }}>
                  {stat.description}
                </p>

                {/* Visual */}
                <div className="flex items-end justify-between">
                  {stat.visual === 'ring' && stat.ringValue !== undefined && (
                    <div className="flex items-center gap-2.5">
                      <ProgressRing value={stat.ringValue} color={stat.color} size={44} />
                      <div>
                        <div className="text-sm font-bold" style={{ color: stat.color }}>{stat.ringValue}%</div>
                        <div className="text-[9px]" style={{ color: 'var(--l-text-muted)' }}>{stat.ringLabel}</div>
                      </div>
                    </div>
                  )}
                  {stat.visual === 'bars' && stat.barData && (
                    <MiniBarChart data={stat.barData} color={stat.color} height={36} />
                  )}
                </div>

                {/* Source */}
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--l-border)' }}>
                  <span className="text-[9px] italic" style={{ color: 'var(--l-text-muted)' }}>
                    Source: {stat.source}
                  </span>
                </div>

                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-2xl"
                  style={{ background: `${stat.color}06` }}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
        >
          <p className="text-sm" style={{ color: 'var(--l-text-secondary)' }}>
            <span style={{ color: 'var(--l-text)' }}>Chronos fixes all of this.</span>{' '}
            One platform. Zero context-switching.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
