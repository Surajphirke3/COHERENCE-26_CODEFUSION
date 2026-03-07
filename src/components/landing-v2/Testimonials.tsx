'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote: "Chronos replaced our entire stack — Trello, Notion, and Slack. Our team saves at least 2 hours every day just from not context-switching.",
    name: 'Sarah Jenkins',
    role: 'Head of Product, TechStart',
    avatar: 'S',
    color: 'bg-indigo-500',
  },
  {
    quote: "The AI assistant is a game-changer. It drafts PRDs and task descriptions in seconds. We shipped our MVP 3 weeks ahead of schedule.",
    name: 'David Chen',
    role: 'Engineering Manager, InnovateCo',
    avatar: 'D',
    color: 'bg-emerald-500',
  },
  {
    quote: "We used to lose critical decisions buried in Slack threads. With Chronos, every conversation is linked to a project. Zero lost context.",
    name: 'Elena Rodriguez',
    role: 'Founding Designer, LaunchPad',
    avatar: 'E',
    color: 'bg-violet-500',
  },
  {
    quote: "The Kanban boards with drag-and-drop are incredibly smooth. Our sprint velocity increased 40% in the first month of switching to Chronos.",
    name: 'Marcus Williams',
    role: 'CTO, BuildFast',
    avatar: 'M',
    color: 'bg-orange-500',
  },
  {
    quote: "Documentation + real-time chat in the same workspace finally makes async work viable for our distributed team across 4 timezones.",
    name: 'Priya Patel',
    role: 'VP Engineering, ScaleUp',
    avatar: 'P',
    color: 'bg-cyan-500',
  },
  {
    quote: "We evaluated Linear, Notion, and Asana. Chronos was the only tool that genuinely unified everything without compromise. Highly recommended.",
    name: 'James Foster',
    role: 'Co-Founder, DevForge',
    avatar: 'J',
    color: 'bg-pink-500',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-32 overflow-hidden">
      <div className="absolute top-0 right-[20%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[140px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-amber-300 text-xs font-medium uppercase tracking-wider mb-6">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Loved by modern teams
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join thousands of startups and agile teams building the next generation of products with Chronos.
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="break-inside-avoid rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm hover:border-white/15 transition-all duration-500"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 text-sm leading-relaxed mb-6">&quot;{t.quote}&quot;</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
