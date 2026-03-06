'use client'

import { use } from 'react'
import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { ArrowLeft, KanbanSquare, Settings, Trash2 } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import AvatarGroup from '@/components/shared/AvatarGroup'
import ProjectForm from '@/components/projects/ProjectForm'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils/date'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: project, mutate } = useSWR(`/api/projects/${id}`, fetcher)
  const [showEdit, setShowEdit] = useState(false)
  const router = useRouter()

  if (!project) return <LoadingSpinner />
  if (project.error) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Project not found</div>

  const members = (project.members || []) as { name: string; avatarUrl?: string; title?: string; email?: string }[]
  const taskStats = project.taskStats || []
  const totalTasks = taskStats.reduce((sum: number, s: { count: number }) => sum + s.count, 0)
  const doneTasks = taskStats.find((s: { _id: string }) => s._id === 'done')?.count || 0
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const handleDelete = async () => {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      toast.success('Project deleted')
      router.push('/projects')
    } catch {
      toast.error('Failed to delete project')
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: project.color || 'var(--primary)' }} />
          <div>
            <h1 style={{ marginBottom: '4px' }}>{project.name}</h1>
            {project.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{project.description}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/projects/${id}/tasks`}>
            <button className="btn-primary"><KanbanSquare size={16} /> Kanban Board</button>
          </Link>
          <button className="btn-secondary" onClick={() => setShowEdit(true)}><Settings size={16} /></button>
          <button className="btn-ghost" onClick={handleDelete} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
          <StatusBadge status={project.status} />
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Progress</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{progress}%</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Tasks</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalTasks}</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Due Date</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{project.dueDate ? formatDate(project.dueDate) : 'Not set'}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Completion</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{doneTasks} / {totalTasks} tasks</span>
        </div>
        <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '100px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: project.color || 'var(--primary)', borderRadius: '100px', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Members */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Team Members</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {members.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar avatar-md">{m.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.title || m.email}</div>
              </div>
            </div>
          ))}
          {members.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No members yet</p>}
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <>
          <div className="overlay" onClick={() => setShowEdit(false)} />
          <div className="modal">
            <ProjectForm
              projectId={id}
              initialData={{
                name: project.name,
                description: project.description || '',
                color: project.color || '#6366f1',
                status: project.status,
                dueDate: project.dueDate?.split('T')[0] || '',
              }}
              onClose={() => setShowEdit(false)}
              onSuccess={() => { setShowEdit(false); mutate() }}
            />
          </div>
        </>
      )}
    </div>
  )
}
