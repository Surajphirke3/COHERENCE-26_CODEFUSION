'use client'

import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useTheme } from '@/components/providers'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="workspace-bg" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      {/* Ambient gradient orbs — dark mode only */}
      {isDark && (
        <>
          <div className="dark-orb dark-orb-1" />
          <div className="dark-orb dark-orb-2" />
          <div className="dark-orb dark-orb-3" />
        </>
      )}

      <div className="sidebar-wrapper">
        <Sidebar />
      </div>

      <div
        className="main-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Topbar />
        <main
          style={{
            flex: 1,
            padding: '24px',
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
