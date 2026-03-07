'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Play } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import type { Variants } from 'framer-motion'

/* ─── Floating 3D Card ────────────────────────────────────────── */
function FloatingCard() {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mx = useSpring(x, { stiffness: 200, damping: 25 })
  const my = useSpring(y, { stiffness: 200, damping: 25 })

  const rX = useTransform(my, [-0.5, 0.5], ['12deg', '-12deg'])
  const rY = useTransform(mx, [-0.5, 0.5], ['-12deg', '12deg'])

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      initial={{ opacity: 0, y: 80, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
      className="mt-20 lg:mt-28 relative mx-auto max-w-5xl"
      style={{ perspective: 2000 }}
    >
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-cyan-600/30 rounded-3xl blur-3xl opacity-60 animate-pulse" />

      <motion.div
        style={{ rotateX: rX, rotateY: rY, transformStyle: 'preserve-3d' }}
        className="relative w-full rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-2xl shadow-2xl overflow-hidden cursor-pointer"
      >
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-white/5 text-xs text-gray-500 font-mono">
              chronos.app/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 flex gap-4 min-h-[320px] lg:min-h-[440px]" style={{ transform: 'translateZ(40px)' }}>
          {/* Sidebar */}
          <div className="hidden md:flex flex-col gap-3 w-48 border-r border-white/5 pr-4">
            {['Dashboard', 'Projects', 'Tasks', 'Messages', 'Docs', 'AI Chat'].map((item, i) => (
              <div
                key={item}
                className={`px-3 py-2 rounded-lg text-sm ${
                  i === 0 ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="flex-1 space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Active Projects', value: '12', color: 'from-indigo-500/20 to-indigo-600/10' },
                { label: 'Tasks Done', value: '89%', color: 'from-emerald-500/20 to-emerald-600/10' },
                { label: 'Team Members', value: '8', color: 'from-violet-500/20 to-violet-600/10' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + Math.random() * 0.5 }}
                  className={`rounded-xl p-4 bg-gradient-to-br ${stat.color} border border-white/5`}
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Activity */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3" style={{ transform: 'translateZ(30px)' }}>
              <div className="text-sm font-medium text-gray-300">Recent Activity</div>
              {[
                { text: 'New task created in Sprint 5', time: '2m ago', color: 'bg-indigo-500' },
                { text: 'Document updated: API Spec', time: '15m ago', color: 'bg-emerald-500' },
                { text: 'AI generated project summary', time: '1h ago', color: 'bg-violet-500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 + i * 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-400 flex-1">{item.text}</span>
                  <span className="text-xs text-gray-600">{item.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Hero Section ─────────────────────────────────────────────── */
export function Hero() {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] },
    }),
  }

  return (
    <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Animated Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-[10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[160px] -z-10"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-[10%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] -z-10"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, delay: 4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Chronos 2.0 — Now with AI Workflows</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl lg:text-8xl font-bold text-white tracking-tight leading-[1.05] mb-8"
          >
            Your startup&apos;s
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 animate-gradient-x">
              operating system
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Stop juggling Trello, Notion, Slack and ChatGPT. Chronos unifies project management,
            real-time chat, documentation, and AI — in one beautiful workspace.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="group relative w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start building free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
            <a
              href="#workflow"
              className="group w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              <Play className="w-4 h-4 text-indigo-400" />
              Watch demo
            </a>
          </motion.div>
        </div>

        {/* 3D Dashboard Card */}
        <FloatingCard />

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">Trusted by teams at</p>
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-40">
            {['TechStart', 'InnovateCo', 'LaunchPad', 'BuildFast', 'ScaleUp'].map((name) => (
              <span key={name} className="text-lg font-bold text-gray-400 tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
