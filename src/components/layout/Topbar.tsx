'use client'

import { useSession } from 'next-auth/react'
import { Search, Bell, Menu } from 'lucide-react'
import { useState } from 'react'
import { useT } from '@/lib/i18n/useLanguage'
import { getInitials } from '@/lib/utils/format'
import MobileNav from './MobileNav'
import NotificationPopup from './NotificationPopup'
import { useNotifications } from '@/lib/hooks/useNotifications'

export default function Topbar() {
  const t = useT()
  const { data: session } = useSession()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { toggle, unreadCount } = useNotifications()

  return (
    <>
      <header
        className="topbar-glass"
        style={{
          height: 'var(--topbar-height)',
          background: 'color-mix(in srgb, var(--bg-base) 85%, transparent)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        {/* Left: Mobile menu + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <button
            className="btn-ghost"
            onClick={() => setMobileNavOpen(true)}
            style={{ padding: '6px' }}
            id="mobile-menu-btn"
          >
            <Menu size={20} />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-sunken)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '5px 10px',
              width: '220px',
              cursor: 'text',
              transition: 'border-color 150ms ease',
            }}
            onClick={(e) => {
              const input = (e.currentTarget as HTMLElement).querySelector('input')
              input?.focus()
            }}
          >
            <Search size={14} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t('topbar.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '13px',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
            <kbd
              style={{
                fontSize: '10px',
                background: 'var(--gray-200)',
                borderRadius: '4px',
                padding: '1px 5px',
                color: 'var(--text-tertiary)',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            id="notification-bell"
            className="btn-ghost"
            style={{ padding: '6px', position: 'relative' }}
            title="Notifications"
            onClick={toggle}
          >
            <Bell size={18} color="var(--text-tertiary)" />
            {unreadCount() > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  right: '3px',
                  minWidth: '16px',
                  height: '16px',
                  background: 'var(--danger)',
                  borderRadius: '9999px',
                  border: '2px solid var(--bg-base)',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {unreadCount()}
              </span>
            )}
          </button>
          <NotificationPopup />

          {session?.user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px 4px 4px',
                borderRadius: 'var(--radius)',
                cursor: 'default',
              }}
            >
              <div className="avatar avatar-sm">{getInitials(session.user.name || 'U')}</div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {session.user.name}
              </span>
            </div>
          )}
        </div>
      </header>

      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  )
}
