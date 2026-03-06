'use client'

import Link from 'next/link'
import { IProject } from '@/lib/types'
import StatusBadge from '@/components/shared/StatusBadge'
import AvatarGroup from '@/components/shared/AvatarGroup'
import { ArrowRight } from 'lucide-react'

interface ProjectOverviewCardProps {
  project: IProject
}

export default function ProjectOverviewCard({ project }: ProjectOverviewCardProps) {
  const members = (project.members || []) as { name: string; avatarUrl?: string }[]
  const taskStats = (project as { taskStats?: { _id: string; count: number }[] }).taskStats
  const totalTasks = taskStats?.reduce((sum, s) => sum + s.count, 0) || 0
  const doneTasks = taskStats?.find((s) => s._id === 'done')?.count || 0
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <Link href={`/projects/${project._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ padding: '20px', height: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: project.color || 'var(--brand-500)',
              flexShrink: 0,
              boxShadow: `0 0 0 3px ${project.color || 'var(--brand-500)'}20`,
            }}
          />
          <h4
            style={{
              flex: 1,
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.name}
          </h4>
          <StatusBadge status={project.status} />
        </div>

        {/* Description */}
        {project.description && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: '16px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
            <span style={{ fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' as const }}>Progress</span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{progress}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--gray-100)', borderRadius: '100px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: project.color || 'var(--brand-500)',
                borderRadius: '100px',
                transition: 'width 500ms var(--ease-out-quint)',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {members.length > 0 && <AvatarGroup users={members} max={3} />}
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
            {totalTasks} tasks <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </Link>
  )
}
