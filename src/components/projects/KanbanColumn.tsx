'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ITask, TaskStatus } from '@/lib/types'
import TaskCard from './TaskCard'

const columnConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'To Do', color: '#a8a8a0' },
  in_progress: { label: 'In Progress', color: '#5b7fff' },
  review: { label: 'Review', color: '#f59e0b' },
  done: { label: 'Done', color: '#16a34a' },
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: ITask[]
  onTaskClick: (task: ITask) => void
}

export default function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const config = columnConfig[status]

  return (
    <div className="kanban-column">
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '2px 4px 10px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: config.color,
          }}
        />
        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{config.label}</span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            background: 'var(--bg-overlay)',
            padding: '1px 6px',
            borderRadius: '10px',
            marginLeft: 'auto',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          background: isOver ? 'var(--brand-50)' : 'transparent',
          border: isOver ? '2px dashed var(--brand-400)' : '2px dashed transparent',
          transition: 'background 200ms ease, border-color 200ms ease',
          minHeight: '100px',
        }}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
