'use client'

import { X, Megaphone } from 'lucide-react'
import { IAnnouncement } from '@/lib/types'

interface AnnouncementBannerProps {
  announcement: IAnnouncement | null
  onDismiss: () => void
}

export default function AnnouncementBanner({ announcement, onDismiss }: AnnouncementBannerProps) {
  if (!announcement) return null

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'var(--brand-50)',
        border: '1px solid var(--brand-200)',
        borderLeft: '3px solid var(--brand-500)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <Megaphone size={16} color="var(--brand-600)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{announcement.title}</strong>
        {announcement.body && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{announcement.body}</p>
        )}
      </div>
      <button className="btn-ghost" onClick={onDismiss} style={{ padding: '4px' }}>
        <X size={14} />
      </button>
    </div>
  )
}
