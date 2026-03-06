'use client'

import { useEffect, useRef } from 'react'
import { X, CheckCheck, Bell, Info, CheckCircle, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react'
import { useNotifications, type Notification } from '@/lib/hooks/useNotifications'

const typeIcon: Record<Notification['type'], typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
}

const typeColor: Record<Notification['type'], string> = {
  info: 'var(--brand-600)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--danger)',
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationPopup() {
  const { notifications, isOpen, setOpen, markRead, markAllRead, dismiss, clearAll, unreadCount } = useNotifications()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const bellBtn = document.getElementById('notification-bell')
        if (bellBtn && bellBtn.contains(e.target as Node)) return
        setOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setOpen])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: 'calc(var(--topbar-height) - 4px)',
        right: '16px',
        width: '380px',
        maxHeight: '480px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} color="var(--text-primary)" />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Notifications</span>
          {unreadCount() > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                background: 'var(--danger)',
                color: '#fff',
                borderRadius: '9999px',
                padding: '1px 7px',
              }}
            >
              {unreadCount()}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {unreadCount() > 0 && (
            <button
              className="btn-ghost"
              onClick={markAllRead}
              style={{ padding: '4px', fontSize: '11px' }}
              title="Mark all as read"
            >
              <CheckCheck size={14} />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="btn-ghost"
              onClick={clearAll}
              style={{ padding: '4px' }}
              title="Clear all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '13px',
            }}
          >
            <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            No notifications
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = typeIcon[n.type]
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  gap: '10px',
                  cursor: 'pointer',
                  background: n.read ? 'transparent' : 'color-mix(in srgb, var(--brand-50) 40%, transparent)',
                  transition: 'background 120ms ease',
                }}
                onMouseOver={(e) => {
                  if (n.read) e.currentTarget.style.background = 'var(--bg-hover)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = n.read
                    ? 'transparent'
                    : 'color-mix(in srgb, var(--brand-50) 40%, transparent)'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: `color-mix(in srgb, ${typeColor[n.type]} 12%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Icon size={14} color={typeColor[n.type]} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{n.title}</span>
                    {!n.read && (
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--brand-600)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {n.message}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <button
                  className="btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    dismiss(n.id)
                  }}
                  style={{ padding: '2px', alignSelf: 'flex-start', flexShrink: 0 }}
                  title="Dismiss"
                >
                  <X size={12} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
