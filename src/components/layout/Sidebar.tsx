'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard, FolderKanban, Users, FileText, Bot, Settings, LogOut, ChevronLeft, Rocket, MessageSquare,
  GitBranch, Plus, Activity
} from 'lucide-react'
import { useState } from 'react'
import { getInitials } from '@/lib/utils/format'

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/projects', label: 'Projects', icon: FolderKanban },
      { href: '/docs', label: 'Docs', icon: FileText },
    ],
  },
  {
    label: 'Outreach',
    items: [
      { href: '/outreach/leads', label: 'Leads', icon: Users },
      { href: '/outreach/workflows', label: 'Workflows', icon: GitBranch },
      { href: '/outreach/workflows/new/builder', label: 'New Workflow', icon: Plus },
      { href: '/outreach/monitor', label: 'Live Monitor', icon: Activity },
    ],
  },
  {
    label: 'Team',
    items: [
      { href: '/team', label: 'Members', icon: Users },
      { href: '/messages', label: 'Messages', icon: MessageSquare },
      { href: '/ai', label: 'AI Assistant', icon: Bot },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      style={{
        width: collapsed ? '64px' : 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms ease',
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '16px 12px' : '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border-subtle)',
          minHeight: 'var(--topbar-height)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: 'var(--brand-50)',
            borderRadius: 'var(--radius-md)',
            flexShrink: 0,
          }}
        >
          <Rocket size={18} color="var(--brand-600)" />
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Workspace
          </span>
        )}
      </div>

      {/* Navigation groups */}
      <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
        {navGroups.map((group, gi) => (
          <div key={group.label} style={{ marginTop: gi === 0 ? '4px' : '20px' }}>
            {/* Group label */}
            {!collapsed && (
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--text-tertiary)',
                  padding: '0 10px 4px',
                }}
              >
                {group.label}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: collapsed ? '8px 14px' : '6px 10px',
                      borderRadius: 'var(--radius)',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'var(--brand-700)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--brand-50)' : 'transparent',
                      transition: 'background 120ms ease, color 120ms ease',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      position: 'relative',
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Active indicator — 3px left border line */}
                    {isActive && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '4px',
                          bottom: '4px',
                          width: '3px',
                          background: 'var(--brand-600)',
                          borderRadius: '0 2px 2px 0',
                        }}
                      />
                    )}
                    <Icon
                      size={18}
                      color={isActive ? 'var(--brand-600)' : 'var(--text-tertiary)'}
                      style={{ flexShrink: 0 }}
                    />
                    {!collapsed && item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: user + actions */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        {session?.user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              marginBottom: '4px',
              borderRadius: 'var(--radius)',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <div className="avatar avatar-sm">{getInitials(session.user.name || 'U')}</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session.user.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session.user.email}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', color: 'var(--text-tertiary)', fontSize: '13px' }}
          title="Sign out"
        >
          <LogOut size={16} />
          {!collapsed && 'Sign out'}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', marginTop: '2px', fontSize: '13px' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={16} style={{ transition: 'transform 200ms ease', transform: collapsed ? 'rotate(180deg)' : 'none' }} />
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  )
}
