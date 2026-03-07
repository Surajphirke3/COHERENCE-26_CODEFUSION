'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Users, FileText, Bot, Settings, X } from 'lucide-react'
import Image from 'next/image'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/docs', label: 'Docs', icon: FileText },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/ai', label: 'AI Assistant', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()
  if (!isOpen) return null

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div
        className="animate-slide-left"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '260px',
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border-subtle)',
          zIndex: 51,
          padding: '16px 8px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'var(--brand-50)', borderRadius: 'var(--radius)' }}>
              <Image src="/logo.png" alt="Chronos" width={18} height={18} style={{ objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Chronos</span>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius)',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? 'var(--brand-700)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--brand-50)' : 'transparent',
                    textDecoration: 'none',
                    position: 'relative',
                    minHeight: '44px',
                  }}
                >
                  {isActive && (
                    <span style={{ position: 'absolute', left: 0, top: '4px', bottom: '4px', width: '3px', background: 'var(--brand-600)', borderRadius: '0 2px 2px 0' }} />
                  )}
                  <Icon size={18} color={isActive ? 'var(--brand-600)' : 'var(--text-tertiary)'} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}
