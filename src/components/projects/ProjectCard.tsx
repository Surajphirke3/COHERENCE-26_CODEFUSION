'use client'

import Link from 'next/link'
import { IProject } from '@/lib/types'
import StatusBadge from '@/components/shared/StatusBadge'
import AvatarGroup from '@/components/shared/AvatarGroup'
import { formatDate } from '@/lib/utils/date'
import { MoreHorizontal, Calendar, KanbanSquare } from 'lucide-react'

interface ProjectCardProps {
  project: IProject
  onUpdate: () => void
}

export default function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const members = (project.members || []) as { name: string; avatarUrl?: string }[]
  const owner = project.ownerId as { name: string } | undefined

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '4px',
            background: project.color || 'var(--primary)',
            flexShrink: 0,
          }}
        />
        <Link
          href={`/projects/${project._id}`}
          style={{
            flex: 1,
            fontWeight: 600,
            fontSize: '1rem',
            textDecoration: 'none',
            color: 'var(--text)',
          }}
        >
          {project.name}
        </Link>
        <StatusBadge status={project.status} />
      </div>

      {/* Description */}
      {project.description && (
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {project.description}
        </p>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {project.dueDate && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> {formatDate(project.dueDate)}
          </span>
        )}
        {owner && (
          <span>by {typeof owner === 'object' ? owner.name : 'Unknown'}</span>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        {members.length > 0 && <AvatarGroup users={members} max={4} />}
        <Link href={`/projects/${project._id}/tasks`}>
          <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
            <KanbanSquare size={14} /> Kanban
          </button>
        </Link>
      </div>
    </div>
  )
}
