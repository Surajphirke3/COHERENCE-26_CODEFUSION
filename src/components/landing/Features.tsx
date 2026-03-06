"use client";

import { LayoutDashboard, FileText, MessageSquare, Bot } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

const features = [
  {
    name: 'Task Management',
    description: 'Keep projects moving forward with kanban boards, lists, and clear ownership.',
    icon: LayoutDashboard,
    gradient: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
  },
  {
    name: 'Team Documentation',
    description: 'Write, collaborate, and organize your most important company knowledge.',
    icon: FileText,
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
  },
  {
    name: 'Real-time Chat',
    description: 'Contextual communication where work happens. Stop context switching.',
    icon: MessageSquare,
    gradient: 'from-purple-500/20 to-violet-600/5',
    iconColor: 'text-purple-400',
  },
  {
    name: 'AI Assistant',
    description: 'Draft PRDs, summarize threads, and automatically generate tasks using AI.',
    icon: Bot,
    gradient: 'from-orange-500/20 to-amber-600/5',
    iconColor: 'text-orange-400',
  },
]

export function Features() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <section id="features" className="py-24 bg-[#0A0A0A] relative border-t border-white/5">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold font-serif text-white sm:text-4xl tracking-tight">Everything your team needs</h2>
          <p className="mt-4 text-lg text-gray-400 leading-relaxed">
            One platform that unites your workflow. Quit juggling between five different tabs and bring your focus back to what matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onHoverStart={() => setHoveredIdx(idx)}
              onHoverEnd={() => setHoveredIdx(null)}
              className="relative group h-full"
            >
              {/* Outer Glow / Borders */}
              <div 
                className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />
              
              <div className="relative flex flex-col items-start p-6 bg-white/[0.02] border border-white/5 rounded-2xl h-full backdrop-blur-sm overflow-hidden transform-gpu transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-white/[0.04] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-crosshair">
                
                {/* Gradient Background blob */}
                <div 
                  className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br \${feature.gradient} blur-3xl rounded-full transition-all duration-500 \${hoveredIdx === idx ? 'opacity-100 scale-150' : 'opacity-40 scale-100'}`}
                />

                <div className="relative z-10 p-3 rounded-xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <feature.icon className={`w-6 h-6 \${feature.iconColor}`} />
                </div>
                
                <h3 className="relative z-10 text-xl font-semibold text-white mb-3 tracking-tight">{feature.name}</h3>
                <p className="relative z-10 text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
