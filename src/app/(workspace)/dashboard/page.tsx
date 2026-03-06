'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { Plus, FileText, Bot, FolderKanban } from 'lucide-react'
import Link from 'next/link'
import QuickStats from '@/components/dashboard/QuickStats'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import ProjectOverviewCard from '@/components/dashboard/ProjectOverviewCard'
import AnnouncementBanner from '@/components/dashboard/AnnouncementBanner'
import StatusBadge from '@/components/shared/StatusBadge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: projects } = useSWR('/api/projects', fetcher, { refreshInterval: 30000 })
  const { data: activities } = useSWR('/api/activity?limit=10', fetcher, { refreshInterval: 10000 })
  const { data: myTasks } = useSWR('/api/tasks?mine=true', fetcher, { refreshInterval: 10000 })
  const { data: team } = useSWR('/api/team', fetcher)
  const [dismissed, setDismissed] = useState(false)

  const activeProjects = projects?.filter((p: { status: string }) => p.status === 'active') || []
  const todayTasks = myTasks?.filter((t: { dueDate: string }) => {
    if (!t.dueDate) return false
    const today = new Date().toISOString().split('T')[0]
    return t.dueDate.split('T')[0] === today
  }) || []
  const doneTasks = myTasks?.filter((t: { status: string }) => t.status === 'done') || []

  const stats = {
    activeProjects: activeProjects.length,
    tasksDueToday: todayTasks.length,
    teamMembers: team?.length || 0,
    completedTasks: doneTasks.length,
  }

  if (!projects) return <LoadingSpinner />

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>
            Welcome back, {session?.user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
            Here&apos;s what&apos;s happening with your team today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/projects">
            <button className="btn-secondary">
              <Plus size={16} /> New Project
            </button>
          </Link>
          <Link href="/ai">
            <button className="btn-primary">
              <Bot size={16} /> Ask AI
            </button>
          </Link>
        </div>
      </div>

      {/* Announcement */}
      {!dismissed && (
        <AnnouncementBanner
          announcement={{
            _id: '1',
            title: '🚀 Welcome to Workspace',
            body: 'Your team operating system is ready. Create your first project to get started!',
            isActive: true,
            createdAt: new Date().toISOString(),
          }}
          onDismiss={() => setDismissed(true)}
        />
      )}

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Two-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '24px',
        }}
        className="dashboard-grid"
      >
        {/* Left: Projects + My Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          {/* Projects */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1rem' }}>Active Projects</h2>
              <Link href="/projects" style={{ fontSize: '13px', color: 'var(--text-brand)' }}>
                View all →
              </Link>
            </div>
            {activeProjects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban size={28} />}
                title="No projects yet"
                description="Create your first project to start organizing work."
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px',
                }}
              >
                {activeProjects.slice(0, 4).map((project: { _id: string } & Record<string, unknown>) => (
                  <ProjectOverviewCard key={project._id} project={project as any} />
                ))}
              </div>
            )}
          </section>

          {/* My Tasks */}
          <section>
            <h2 style={{ fontSize: '1rem', marginBottom: '16px' }}>My Tasks</h2>
            {!myTasks || myTasks.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No tasks assigned to you yet.
              </div>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                {myTasks.filter((t: { status: string }) => t.status !== 'done').slice(0, 8).map((task: { _id: string; title: string; status: string; priority: string; projectId?: { name: string; color: string } }, i: number, arr: unknown[]) => (
                  <div
                    key={task._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom: i < (arr as unknown[]).length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: task.projectId?.color || 'var(--primary)',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, fontSize: '13.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                      {task.title}
                    </span>
                    <StatusBadge status={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: Activity Feed */}
        <aside style={{ minWidth: 0 }}>
          <div className="card" style={{ position: 'sticky', top: 'calc(var(--topbar-height) + 24px)' }}>
            <div style={{ padding: '16px 16px 0', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Activity Feed</h3>
            </div>
            <ActivityFeed activities={activities || []} />
          </div>
        </aside>
      </div>
    </div>
  )
}
