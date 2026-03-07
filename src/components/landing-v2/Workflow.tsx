'use client'

import { motion } from 'framer-motion'
import { ClipboardList, MessageSquare, FileEdit, Brain, ArrowRight, GitBranch } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: ClipboardList,
    title: 'Plan & Organize',
    description: 'Create projects, break them into tasks, and organize on visual Kanban boards. Assign team members, set priorities, and track deadlines — all in one view.',
    visual: (
      <div className="space-y-3">
        {['Sprint 5: User Auth', 'Sprint 6: Payment Flow', 'Sprint 7: Analytics'].map((task, i) => (
          <motion.div
            key={task}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5"
          >
            <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-emerald-400' : i === 1 ? 'bg-indigo-400' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-300 flex-1">{task}</span>
            <span className="text-xs text-gray-600">{i === 0 ? 'Done' : i === 1 ? 'In Progress' : 'Todo'}</span>
          </motion.div>
        ))}
      </div>
    ),
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    step: '02',
    icon: MessageSquare,
    title: 'Communicate Instantly',
    description: 'Chat with your team in real-time. Create channels for projects, DM teammates, and keep all discussions linked to the work that matters.',
    visual: (
      <div className="space-y-3">
        {[
          { name: 'Sarah', msg: 'Just pushed the new auth flow!', color: 'bg-indigo-500' },
          { name: 'Alex', msg: 'Looks great, reviewing now', color: 'bg-emerald-500' },
          { name: 'AI', msg: 'PR has 3 changes, summary ready', color: 'bg-violet-500' },
        ].map((chat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5"
          >
            <div className={`w-7 h-7 rounded-full ${chat.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {chat.name[0]}
            </div>
            <div>
              <div className="text-xs font-medium text-gray-300">{chat.name}</div>
              <div className="text-xs text-gray-500">{chat.msg}</div>
            </div>
          </motion.div>
        ))}
      </div>
    ),
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    step: '03',
    icon: FileEdit,
    title: 'Document Everything',
    description: 'Write beautiful documentation with our rich text editor powered by Tiptap. Link docs to projects, collaborate, and auto-save your work.',
    visual: (
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
        <div className="flex gap-2 mb-3 pb-2 border-b border-white/5">
          <div className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-500">Bold</div>
          <div className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-500">Italic</div>
          <div className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-500">Code</div>
          <div className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-500">H1</div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <div className="text-lg font-bold text-white">API Documentation</div>
          <div className="text-sm text-gray-400">The authentication system uses JWT tokens stored in HTTP-only cookies...</div>
          <div className="text-sm text-gray-500 mt-2">Auto-saved 2 seconds ago</div>
        </motion.div>
      </div>
    ),
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    step: '04',
    icon: Brain,
    title: 'AI Powers Everything',
    description: 'Ask questions, generate summaries, create task descriptions, and get intelligent suggestions. All powered by Groq for blazing-fast responses.',
    visual: (
      <div className="space-y-3">
        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-3">
          <div className="text-xs text-indigo-300 font-medium mb-1">You asked:</div>
          <div className="text-sm text-gray-300">&quot;Summarize our Q4 sprint progress&quot;</div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3"
        >
          <div className="text-xs text-violet-300 font-medium mb-1">AI Response:</div>
          <div className="text-sm text-gray-300">&quot;Q4 completed 89% of planned tasks across 3 sprints. Auth module shipped ahead of schedule...&quot;</div>
        </motion.div>
      </div>
    ),
    gradient: 'from-orange-500 to-amber-500',
  },
]

export function Workflow() {
  return (
    <section id="workflow" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[160px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-violet-300 text-xs font-medium uppercase tracking-wider mb-6">
            <GitBranch className="w-3.5 h-3.5" />
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            A workflow that flows
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From planning to launch, Chronos guides your team through every step with integrated tools and intelligent automation.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />

          <div className="space-y-24">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className={`flex flex-col lg:flex-row items-center gap-12 ${!isEven ? 'lg:flex-row-reverse' : ''}`}
                >
                  {/* Content */}
                  <div className="flex-1 max-w-lg">
                    <div className={`inline-flex items-center gap-3 mb-6`}>
                      <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg`}>
                        <step.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-mono text-gray-500">Step {step.step}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed mb-6">{step.description}</p>
                    <a href="#features" className="inline-flex items-center gap-1 text-indigo-400 text-sm font-medium hover:gap-2 transition-all">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Visual */}
                  <div className="flex-1 w-full max-w-lg">
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
                      {step.visual}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
