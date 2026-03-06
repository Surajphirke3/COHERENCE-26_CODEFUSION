'use client'

import { getInitials } from '@/lib/utils/format'
import { ITask } from '@/lib/types'
import StatusBadge from '@/components/shared/StatusBadge'
import { GripVertical, Calendar } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TaskCardProps {
  task: ITask
  onClick: () => void
}

const priorityBorderClass: Record<string, string> = {
  urgent: 'priority-urgent-border',
  high: 'priority-high-border',
  medium: 'priority-medium-border',
  low: 'priority-low-border',
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const assignee = task.assigneeId as { name: string; avatarUrl?: string } | undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${priorityBorderClass[task.priority] || ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div style={{ padding: '11px 12px 12px', cursor: 'pointer' }}>
        {/* Drag handle + Priority */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <button
            {...attributes}
            {...listeners}
            style={{
              cursor: 'grab',
              background: 'none',
              border: 'none',
              color: 'var(--text-disabled)',
              padding: '0',
              display: 'flex',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </button>
          <StatusBadge status={task.priority} />
          {task.tags?.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                background: 'var(--bg-sunken)',
                border: '1px solid var(--border-subtle)',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 500,
              }}
            >
              {task.tags[0]}
            </span>
          )}
        </div>

        {/* Title */}
        <h4
          style={{
            fontSize: '13.5px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.title}
        </h4>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {assignee && (
            <div className="avatar avatar-sm" title={assignee.name}>
              {getInitials(assignee.name)}
            </div>
          )}
          {task.dueDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              <Calendar size={10} />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
