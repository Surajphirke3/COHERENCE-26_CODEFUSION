'use client'

import { motion } from 'framer-motion'
import { Shield, Wrench, TrendingUp, Users, BrainCircuit, Globe } from 'lucide-react'

const problems = [
  {
    icon: Wrench,
    problem: 'Tool fragmentation',
    solution: 'One unified platform replaces Trello + Notion + Slack + ChatGPT. Stop paying for 4 tools and toggling 15 browser tabs.',
    stat: '4 tools → 1',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    icon: Users,
    problem: 'Communication silos',
    solution: 'Every message is linked to a project, task, or document. No more lost context or "what channel was that in?"',
    stat: '0 lost context',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: TrendingUp,
    problem: 'No visibility into progress',
    solution: 'Real-time dashboards show task completion, team activity, and project health at a glance. Know exactly where your sprint stands.',
    stat: '89% faster insights',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: BrainCircuit,
    problem: 'Manual busywork',
    solution: 'AI writes task descriptions, summarizes documents, and answers questions about your workspace. Save hours every week.',
    stat: '10+ hrs saved/week',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Shield,
    problem: 'Security concerns',
    solution: 'Enterprise-grade auth with encrypted JWT sessions, bcrypt password hashing, and middleware-level route protection.',
    stat: 'Bank-level security',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Globe,
    problem: 'Slow and clunky tools',
    solution: 'Built on Next.js 16 with server components and Turbopack. Pages load instantly. Interactions feel native. Zero lag.',
    stat: '<100ms loads',
    gradient: 'from-pink-500 to-rose-500',
  },
]

export function Solutions() {
  return (
    <section id="solutions" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[140px] -z-10" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-emerald-300 text-xs font-medium uppercase tracking-wider mb-6">
            Solutions
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Problems we solve
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Startup teams waste hours every day on fragmented tools and lost context. Here&apos;s how Chronos fixes that.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((item, i) => (
            <motion.div
              key={item.problem}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm hover:border-white/15 transition-all duration-500 overflow-hidden"
            >
              {/* Top gradient line */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Stat Badge */}
              <div className="absolute top-6 right-6">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-white`}>
                  {item.stat}
                </span>
              </div>

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.gradient} mb-6 shadow-lg`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>

              {/* Problem */}
              <div className="text-sm text-red-400/80 font-medium mb-2 line-through decoration-red-500/40">
                {item.problem}
              </div>

              {/* Solution */}
              <p className="text-gray-300 leading-relaxed text-sm">{item.solution}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
