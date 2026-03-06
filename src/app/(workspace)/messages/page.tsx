import ChatLayout from './components/ChatLayout'

export const metadata = {
  title: 'Messages | Workspace',
  description: 'Team messaging and group chats',
}

export default function MessagesPage() {
  return (
    <div style={{ height: 'calc(100vh - var(--topbar-height) - 48px)' }}>
      <div style={{ 
        height: '100%',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        display: 'flex'
      }}>
        <ChatLayout />
      </div>
    </div>
  )
}
