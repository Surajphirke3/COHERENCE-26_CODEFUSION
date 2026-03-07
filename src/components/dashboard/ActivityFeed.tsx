'use client'

import { timeAgo } from '@/lib/utils/date'
import { getInitials } from '@/lib/utils/format'
import { IActivityLog } from '@/lib/types'
import { Activity } from 'lucide-react'

const actionLabels: Record<string, string> = {
  created_project: 'created project',
  updated_project: 'updated project',
  deleted_project: 'deleted project',
  created_task: 'created task',
  updated_task: 'updated task',
  moved_task: 'moved task',
  deleted_task: 'deleted task',
  created_document: 'created document',
  updated_document: 'updated document',
  deleted_document: 'deleted document',
}

interface ActivityFeedProps {
  activities: IActivityLog[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        <Activity size={20} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
        <p style={{ fontSize: '13px' }}>No activity yet</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {activities.map((activity, i) => {
        const actor = activity.actorId as { name: string; avatarUrl?: string } | undefined
        const metadata = activity.metadata as { from?: string; to?: string } | undefined

        return (
          <div
            key={activity._id || i}
            style={{
              display: 'flex',
              gap: '10px',
              padding: '10px 16px',
              borderBottom: i < activities.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            {/* Connecting timeline line */}
            {i < activities.length - 1 && (
              <div
                className="activity-timeline-line"
                style={{
                  position: 'absolute',
                  left: '29px',
                  top: '38px',
                  bottom: '-1px',
                  width: '1px',
                  background: 'var(--border-subtle)',
                }}
              />
            )}

            <div
              className="avatar avatar-sm"
              style={{
                marginTop: '2px',
                position: 'relative',
                zIndex: 1,
                borderColor: 'white',
              }}
            >
              {actor ? getInitials(actor.name) : '?'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                <strong style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{actor?.name || 'Unknown'}</strong>{' '}
                {actionLabels[activity.action] || activity.action}{' '}
                <strong style={{ fontWeight: 500, color: 'var(--text-brand)' }}>{activity.entityTitle}</strong>
                {activity.action === 'moved_task' && metadata && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      background: 'var(--bg-sunken)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      padding: '1px 6px',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      verticalAlign: 'middle',
                      marginLeft: '4px',
                    }}
                  >
                    {metadata.from} → {metadata.to}
                  </span>
                )}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                {timeAgo(activity.createdAt)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
