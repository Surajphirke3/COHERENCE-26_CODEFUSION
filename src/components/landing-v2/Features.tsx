'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, MessageSquare, FileText, Bot, CheckSquare, Zap } from 'lucide-react'

const features = [
  {
    icon: LayoutDashboard,
    title: 'Project Management',
    description: 'Kanban boards, sprint planning, and task tracking with drag-and-drop. Keep every project organized and on track.',
    gradient: 'from-indigo-500 to-blue-500',
    glow: 'bg-indigo-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Chat',
    description: 'Direct messages, group channels, and threaded conversations. No more context-switching between Slack and your project tool.',
    gradient: 'from-violet-500 to-purple-500',
    glow: 'bg-violet-500/20',
  },
  {
    icon: FileText,
    title: 'Collaborative Docs',
    description: 'Rich text editor with real-time collaboration. Write specs, meeting notes, and guides — all linked to your projects.',
    gradient: 'from-emerald-500 to-green-500',
    glow: 'bg-emerald-500/20',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Built-in AI powered by Groq. Summarize docs, generate task descriptions, and get answers about your workspace instantly.',
    gradient: 'from-orange-500 to-amber-500',
    glow: 'bg-orange-500/20',
  },
  {
    icon: CheckSquare,
    title: 'Task Automation',
    description: 'Automate repetitive workflows with smart rules. When a task moves to "Done", notify the team and update the dashboard.',
    gradient: 'from-cyan-500 to-teal-500',
    glow: 'bg-cyan-500/20',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Next.js 16 with server components and edge functions. Sub-second page loads and instant interactions.',
    gradient: 'from-pink-500 to-rose-500',
    glow: 'bg-pink-500/20',
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] -z-10" style={{ background: 'var(--l-glow-1)' }} />

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
            Features
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ color: 'var(--l-text)' }}>
            Everything your team needs
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--l-text-secondary)' }}>
            One platform that replaces five different tools. Quit juggling between tabs and bring your focus back to what matters.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative rounded-2xl p-8 backdrop-blur-sm transition-all duration-500"
              style={{
                background: 'var(--l-bg-card)',
                border: '1px solid var(--l-border)',
              }}
            >
              {/* Hover Glow */}
              <div className={`absolute inset-0 rounded-2xl ${feature.glow} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10`} />

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--l-text)' }}>{feature.title}</h3>
              <p className="leading-relaxed text-sm" style={{ color: 'var(--l-text-secondary)' }}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
