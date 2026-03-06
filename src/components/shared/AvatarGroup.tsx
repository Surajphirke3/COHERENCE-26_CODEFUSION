'use client'

import { getInitials } from '@/lib/utils/format'

interface AvatarGroupProps {
  users: { name: string; avatarUrl?: string }[]
  max?: number
}

export default function AvatarGroup({ users, max = 4 }: AvatarGroupProps) {
  const visible = users.slice(0, max)
  const remaining = users.length - max

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((user, i) => (
        <div
          key={i}
          className="avatar avatar-sm"
          style={{
            marginLeft: i > 0 ? '-6px' : '0',
            zIndex: visible.length - i,
            border: '2px solid white',
          }}
          title={user.name}
        >
          {getInitials(user.name)}
        </div>
      ))}
      {remaining > 0 && (
        <div
          style={{
            marginLeft: '-6px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gray-100)',
            color: 'var(--text-tertiary)',
            fontSize: '10px',
            fontWeight: 600,
            border: '2px solid white',
            zIndex: 0,
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
