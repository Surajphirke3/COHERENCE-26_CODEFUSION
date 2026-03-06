'use client'

import { use, useState } from 'react'
import { useTasks } from '@/lib/hooks/useTasks'
import useSWR from 'swr'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'
import KanbanBoard from '@/components/projects/KanbanBoard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { ITask } from '@/lib/types'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function KanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { tasks, isLoading, mutate } = useTasks(id)
  const { data: project } = useSWR(`/api/projects/${id}`, fetcher)
  const { data: team } = useSWR('/api/team', fetcher)
  const { data: session } = useSession()
  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null)

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: '',
  })

  const handleTaskUpdate = async (taskId: string, updates: Partial<ITask>) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    mutate()
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title) return

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          projectId: id,
          status: 'todo',
          assigneeId: newTask.assigneeId || undefined,
        }),
      })
      toast.success('Task created!')
      setNewTask({ title: '', description: '', priority: 'medium', assigneeId: '' })
      setShowForm(false)
      mutate()
    } catch {
      toast.error('Failed to create task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    toast.success('Task deleted')
    setSelectedTask(null)
    mutate()
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href={`/projects/${id}`} style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>
              {project?.name || 'Project'} — Board
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              {tasks.length} tasks total
            </p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Kanban */}
      <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} onTaskClick={setSelectedTask} />

      {/* Create Task Modal */}
      {showForm && (
        <>
          <div className="overlay" onClick={() => setShowForm(false)} />
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>New Task</h2>
              <button className="btn-ghost" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="label">Title *</label>
                  <input className="input" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="textarea" placeholder="Details…" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={3} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label">Priority</label>
                    <select className="select" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Assignee</label>
                    <select className="select" value={newTask.assigneeId} onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}>
                      <option value="">Unassigned</option>
                      {team?.map((m: { _id: string; name: string }) => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Task Detail Drawer */}
      {selectedTask && (
        <>
          <div className="overlay" onClick={() => setSelectedTask(null)} />
          <div className="drawer" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Task Details</h2>
              <button className="btn-ghost" onClick={() => setSelectedTask(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Title</label>
                <input className="input" value={selectedTask.title} onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="textarea" value={selectedTask.description || ''} onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })} rows={4} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Status</label>
                  <select className="select" value={selectedTask.status} onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value as any })}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select className="select" value={selectedTask.priority} onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value as any })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Assignee</label>
                <select className="select" value={(selectedTask.assigneeId as { _id?: string })?._id || ''} onChange={(e) => setSelectedTask({ ...selectedTask, assigneeId: e.target.value as any })}>
                  <option value="">Unassigned</option>
                  {team?.map((m: { _id: string; name: string }) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '8px' }}>
                <button className="btn-danger" onClick={() => handleDeleteTask(selectedTask._id)} style={{ padding: '8px 16px' }}>Delete</button>
                <button className="btn-primary" onClick={async () => {
                  await handleTaskUpdate(selectedTask._id, {
                    title: selectedTask.title,
                    description: selectedTask.description,
                    status: selectedTask.status,
                    priority: selectedTask.priority,
                    assigneeId: typeof selectedTask.assigneeId === 'string' ? selectedTask.assigneeId : (selectedTask.assigneeId as { _id?: string })?._id,
                  } as any)
                  toast.success('Task updated!')
                  setSelectedTask(null)
                }}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
