import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
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
