'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6']

interface ProjectFormProps {
  onClose: () => void
  onSuccess: () => void
  initialData?: {
    name: string
    description: string
    color: string
    status: string
    dueDate: string
  }
  projectId?: string
}

export default function ProjectForm({ onClose, onSuccess, initialData, projectId }: ProjectFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    color: initialData?.color || '#6366f1',
    status: initialData?.status || 'active',
    dueDate: initialData?.dueDate || '',
  })

  const isEdit = !!projectId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEdit ? `/api/projects/${projectId}` : '/api/projects'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to save project')

      toast.success(isEdit ? 'Project updated!' : 'Project created!')
      onSuccess()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem' }}>{isEdit ? 'Edit Project' : 'New Project'}</h2>
        <button type="button" className="btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="label">Project Name *</label>
          <input
            className="input"
            placeholder="e.g. Mobile App v2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="textarea"
            placeholder="What's this project about?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <label className="label">Color</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius)',
                  background: c,
                  border: form.color === c ? '2px solid white' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                  transform: form.color === c ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="label">Status</label>
            <select
              className="select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}

        <div>
          <label className="label">Due Date</label>
          <input
            className="input"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}
