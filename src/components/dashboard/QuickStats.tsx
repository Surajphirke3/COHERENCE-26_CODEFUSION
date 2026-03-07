'use client'

import { FolderKanban, CheckCircle, Users, Clock } from 'lucide-react'

interface QuickStatsProps {
  stats: {
    activeProjects: number
    tasksDueToday: number
    teamMembers: number
    completedTasks: number
  }
}

export default function QuickStats({ stats }: QuickStatsProps) {
  const items = [
    { label: 'Active Projects', value: stats.activeProjects, icon: FolderKanban, color: 'var(--brand-600)', bg: 'var(--brand-50)' },
    { label: 'Due Today', value: stats.tasksDueToday, icon: Clock, color: 'var(--warning)', bg: 'var(--warning-bg)' },
    { label: 'Team Members', value: stats.teamMembers, icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Tasks Done', value: stats.completedTasks, icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-bg)' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {items.map((item, idx) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="card stagger-item stat-card"
            style={{
              padding: '20px 24px',
              position: 'relative',
              overflow: 'hidden',
              animationDelay: `${idx * 60}ms`,
            }}
          >
            {/* Decorative circle */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: item.bg,
                opacity: 0.6,
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1,
                letterSpacing: '-0.025em',
                marginBottom: '10px',
              }}
            >
              {item.value}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '20px',
                background: item.bg,
                fontSize: '11px',
                fontWeight: 500,
                color: item.color,
              }}
            >
              <Icon size={12} />
              {item.label.split(' ')[0]}
            </div>
          </div>
        )
      })}
    </div>
  )
}
