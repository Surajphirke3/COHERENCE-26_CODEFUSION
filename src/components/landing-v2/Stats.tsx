'use client'

import { motion } from 'framer-motion'

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '500+', label: 'Teams Onboarded' },
  { value: '2M+', label: 'Tasks Completed' },
  { value: '99.9%', label: 'Uptime' },
]

export function Stats() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: 'var(--l-glow-1)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--l-text)' }}>{stat.value}</div>
              <div className="text-sm" style={{ color: 'var(--l-text-secondary)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
