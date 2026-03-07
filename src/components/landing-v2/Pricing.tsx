'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const tiers = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for small teams just getting started.',
    features: [
      'Up to 5 team members',
      '3 active projects',
      'Basic Kanban boards',
      'Direct messaging',
      '1 GB document storage',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/user/mo',
    description: 'For growing teams that need the full toolkit.',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Advanced Kanban + Sprints',
      'Group channels + DMs',
      'AI Assistant (Groq)',
      'Rich text documentation',
      '50 GB storage',
      'Priority support',
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations requiring advanced controls.',
    features: [
      'Everything in Pro',
      'SSO / SAML auth',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Unlimited storage',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] -z-10" style={{ background: 'var(--l-glow-1)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Pricing
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ color: 'var(--l-text)' }}>
            Simple, transparent pricing
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--l-text-secondary)' }}>
            Start free. Upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 backdrop-blur-sm transition-all duration-500 ${
                tier.highlighted ? 'scale-105 shadow-2xl' : ''
              }`}
              style={{
                background: tier.highlighted
                  ? 'linear-gradient(to bottom, var(--l-accent-muted), transparent)'
                  : 'var(--l-bg-card)',
                border: tier.highlighted
                  ? '1px solid var(--l-accent)'
                  : '1px solid var(--l-border)',
              }}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="px-3 py-1 text-xs font-semibold rounded-full"
                    style={{ background: 'var(--l-accent)', color: 'var(--l-bg)' }}
                  >
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--l-text)' }}>{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: 'var(--l-text)' }}>{tier.price}</span>
                  {tier.period && <span className="text-sm" style={{ color: 'var(--l-text-tertiary)' }}>{tier.period}</span>}
                </div>
                <p className="text-sm mt-2" style={{ color: 'var(--l-text-secondary)' }}>{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: 'var(--l-text-secondary)' }}>
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                style={{
                  background: tier.highlighted ? 'var(--l-accent)' : 'var(--l-badge-bg)',
                  color: tier.highlighted ? 'var(--l-bg)' : 'var(--l-text)',
                  border: tier.highlighted ? 'none' : '1px solid var(--l-border)',
                }}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
