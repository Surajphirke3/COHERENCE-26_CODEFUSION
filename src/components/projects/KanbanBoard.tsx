'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { ITask, TaskStatus } from '@/lib/types'
import KanbanColumn from './KanbanColumn'
import { toast } from 'sonner'

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']

interface KanbanBoardProps {
  tasks: ITask[]
  onTaskUpdate: (taskId: string, updates: Partial<ITask>) => Promise<void>
  onTaskClick: (task: ITask) => void
}

export default function KanbanBoard({ tasks, onTaskUpdate, onTaskClick }: KanbanBoardProps) {
  const [localTasks, setLocalTasks] = useState<ITask[]>(tasks)

  // Update local tasks when props change (SWR revalidation)
  if (JSON.stringify(tasks.map((t) => t._id + t.status)) !== JSON.stringify(localTasks.map((t) => t._id + t.status))) {
    setLocalTasks(tasks)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const getColumnTasks = (status: TaskStatus) =>
    localTasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    // Only process if dropped on a column (not another task)
    if (!COLUMNS.includes(newStatus)) return

    const task = localTasks.find((t) => t._id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    setLocalTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    )

    try {
      await onTaskUpdate(taskId, { status: newStatus })
    } catch {
      // Revert on failure
      setLocalTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: task.status } : t))
      )
      toast.error('Failed to move task')
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="kanban-scroll">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={getColumnTasks(status)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </DndContext>
  )
}
