'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/landing-v2/ThemeContext'
import { CheckCircle2, Mail, Bot, Send, Database, Globe, Sparkles } from 'lucide-react'

// ── Dot grid canvas ──────────────────────────────────────────
function DotGrid({ theme }: { theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const frameRef = useRef<number>(0)
  const isDark = theme === 'dark'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouse)

    const spacing = 40
    const baseRadius = 1.2
    const hoverRadius = 3
    const hoverRange = 120

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const { x: mx, y: my } = mouseRef.current
      const cols = Math.ceil(canvas.width / spacing) + 1
      const rows = Math.ceil(canvas.height / spacing) + 1

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing
          const y = row * spacing
          const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2)
          const t = Math.max(0, 1 - dist / hoverRange)
          const r = baseRadius + (hoverRadius - baseRadius) * t * t
          const alpha = isDark
            ? 0.06 + 0.25 * t * t
            : 0.05 + 0.2 * t * t

          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fillStyle = isDark
            ? `rgba(250, 228, 207, ${alpha})`
            : `rgba(9, 14, 35, ${alpha})`
          ctx.fill()

          // Draw connecting lines between nearby hovered dots
          if (t > 0.3) {
            // connect right
            if (col < cols - 1) {
              const nx = (col + 1) * spacing
              const ny = row * spacing
              const nd = Math.sqrt((nx - mx) ** 2 + (ny - my) ** 2)
              const nt = Math.max(0, 1 - nd / hoverRange)
              if (nt > 0.3) {
                ctx.beginPath()
                ctx.moveTo(x, y)
                ctx.lineTo(nx, ny)
                ctx.strokeStyle = isDark
                  ? `rgba(250, 228, 207, ${Math.min(t, nt) * 0.15})`
                  : `rgba(9, 14, 35, ${Math.min(t, nt) * 0.1})`
                ctx.lineWidth = 0.5
                ctx.stroke()
              }
            }
            // connect down
            if (row < rows - 1) {
              const nx = col * spacing
              const ny = (row + 1) * spacing
              const nd = Math.sqrt((nx - mx) ** 2 + (ny - my) ** 2)
              const nt = Math.max(0, 1 - nd / hoverRange)
              if (nt > 0.3) {
                ctx.beginPath()
                ctx.moveTo(x, y)
                ctx.lineTo(nx, ny)
                ctx.strokeStyle = isDark
                  ? `rgba(250, 228, 207, ${Math.min(t, nt) * 0.15})`
                  : `rgba(9, 14, 35, ${Math.min(t, nt) * 0.1})`
                ctx.lineWidth = 0.5
                ctx.stroke()
              }
            }
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      cancelAnimationFrame(frameRef.current)
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}

// ── Flowing orbital paths (SVG) ──────────────────────────────
function OrbitalPaths({ theme }: { theme: string }) {
  const isDark = theme === 'dark'
  const strokeColor = isDark ? 'rgba(250, 228, 207, 0.05)' : 'rgba(9, 14, 35, 0.04)'
  const glowColor = isDark ? 'rgba(250, 228, 207, 0.35)' : 'rgba(9, 14, 35, 0.25)'

  const paths = [
    { d: 'M -100,300 Q 400,100 900,350 T 1920,200', duration: 18, delay: 0 },
    { d: 'M -50,500 Q 300,700 700,400 T 1400,600 T 2000,500', duration: 22, delay: 2 },
    { d: 'M 1920,150 Q 1400,400 800,200 T -100,350', duration: 20, delay: 4 },
    { d: 'M -100,700 Q 500,500 1000,750 T 2000,600', duration: 24, delay: 1 },
    { d: 'M 2000,800 Q 1200,600 600,850 T -100,700', duration: 19, delay: 3 },
  ]

  return (
    <svg
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <filter id="orbGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {paths.map((p, i) => (
        <g key={i}>
          {/* Static path trace */}
          <motion.path
            d={p.d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: p.delay, duration: 3, ease: 'easeOut' }}
          />
          {/* Travelling orb */}
          <motion.circle
            r={3}
            fill={glowColor}
            filter="url(#orbGlow)"
          >
            <animateMotion
              dur={`${p.duration}s`}
              repeatCount="indefinite"
              begin={`${p.delay}s`}
              path={p.d}
            />
          </motion.circle>
        </g>
      ))}
    </svg>
  )
}

// ── Floating glass workflow cards ────────────────────────────
const workflowCards = [
  {
    title: 'Email Automation',
    desc: '3 workflows active',
    color: '#6366f1',
    x: 6, y: 18, delay: 0.3, rotate: -3,
  },
  {
    title: 'AI Processing',
    desc: '12 tasks queued',
    color: '#8b5cf6',
    x: 82, y: 14, delay: 0.8, rotate: 2,
  },
  {
    title: 'Data Pipeline',
    desc: 'Syncing 4 sources',
    color: '#06b6d4',
    x: 8, y: 72, delay: 1.2, rotate: 2,
  },
  {
    title: 'Notifications',
    desc: 'Slack + Discord',
    color: '#f59e0b',
    x: 85, y: 75, delay: 0.6, rotate: -2,
  },
]

function FloatingCard({ title, desc, color, x, y, delay, rotate, theme }: {
  title: string; desc: string; color: string
  x: number; y: number; delay: number; rotate: number; theme: string
}) {
  const isDark = theme === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: delay + 0.5, duration: 0.8, type: 'spring', stiffness: 150 }}
      style={{
        position: 'fixed',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [rotate, rotate + 1.5, rotate - 1.5, rotate],
        }}
        transition={{
          y: { duration: 5 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '14px',
            background: isDark
              ? 'rgba(250, 228, 207, 0.04)'
              : 'rgba(9, 14, 35, 0.03)',
            border: `1px solid ${isDark ? 'rgba(250, 228, 207, 0.07)' : 'rgba(9, 14, 35, 0.06)'}`,
            backdropFilter: 'blur(16px)',
            minWidth: '150px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 8px ${color}50`,
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: isDark ? 'rgba(250, 228, 207, 0.6)' : 'rgba(9, 14, 35, 0.55)',
                letterSpacing: '0.3px',
              }}
            >
              {title}
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              color: isDark ? 'rgba(250, 228, 207, 0.3)' : 'rgba(9, 14, 35, 0.3)',
            }}
          >
            {desc}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Status ticker ────────────────────────────────────────────
const statusItems = [
  { text: 'Email workflow triggered', icon: Mail },
  { text: 'AI agent processed 12 tasks', icon: Bot },
  { text: 'Scheduled report sent', icon: Send },
  { text: 'Data sync completed', icon: Database },
  { text: 'New webhook received', icon: Globe },
  { text: '3 workflows optimized', icon: Sparkles },
]

function StatusTicker({ theme }: { theme: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const isDark = theme === 'dark'

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % statusItems.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const item = statusItems[currentIndex]
  const Icon = item.icon

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 500,
            color: isDark ? 'rgba(250, 228, 207, 0.5)' : 'rgba(9, 14, 35, 0.45)',
            background: isDark ? 'rgba(250, 228, 207, 0.04)' : 'rgba(9, 14, 35, 0.03)',
            border: `1px solid ${isDark ? 'rgba(250, 228, 207, 0.06)' : 'rgba(9, 14, 35, 0.05)'}`,
            backdropFilter: 'blur(12px)',
            whiteSpace: 'nowrap',
          }}
        >
          <CheckCircle2 size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
          <Icon size={13} style={{ opacity: 0.5, flexShrink: 0 }} />
          {item.text}
          <motion.div
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#22c55e',
            }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Main background component ────────────────────────────────
export function AuthBackground() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <>
      {/* Interactive dot grid */}
      <DotGrid theme={theme} />

      {/* Flowing orbital paths with travelling orbs */}
      <OrbitalPaths theme={theme} />

      {/* Floating workflow cards */}
      {workflowCards.map((card, i) => (
        <FloatingCard key={i} {...card} theme={theme} />
      ))}

      {/* Large ambient gradient orbs */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -35, 20, 0],
          scale: [1, 1.3, 0.85, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, rgba(250, 228, 207, 0.02) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, rgba(9, 14, 35, 0.015) 40%, transparent 70%)',
          top: '-15%',
          left: '-10%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{
          x: [0, -35, 25, 0],
          y: [0, 25, -40, 0],
          scale: [1, 0.85, 1.25, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, rgba(250, 228, 207, 0.015) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.035) 0%, rgba(9, 14, 35, 0.01) 40%, transparent 70%)',
          bottom: '-20%',
          right: '-15%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.04) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6, 182, 212, 0.03) 0%, transparent 70%)',
          top: '30%',
          right: '5%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Status ticker */}
      <StatusTicker theme={theme} />
    </>
  )
}
