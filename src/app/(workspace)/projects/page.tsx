'use client'

import { useState } from 'react'
import { useProjects } from '@/lib/hooks/useProjects'
import { Plus, Search } from 'lucide-react'
import ProjectCard from '@/components/projects/ProjectCard'
import ProjectForm from '@/components/projects/ProjectForm'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function ProjectsPage() {
  const { projects, isLoading, mutate } = useProjects()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = projects.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1>Projects</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['all', 'active', 'paused', 'done'].map((s) => (
            <button
              key={s}
              className={filter === s ? 'btn-primary' : 'btn-ghost'}
              onClick={() => setFilter(s)}
              style={{ padding: '6px 14px', fontSize: '0.8125rem', textTransform: 'capitalize' }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No matching projects' : 'No projects yet'}
          description={search ? 'Try a different search term.' : 'Create your first project to get started.'}
          action={
            !search ? (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={16} /> Create Project
              </button>
            ) : undefined
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} onUpdate={mutate} />
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <>
          <div className="overlay" onClick={() => setShowForm(false)} />
          <div className="modal" style={{ maxWidth: '560px' }}>
            <ProjectForm
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false)
                mutate()
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
