interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'var(--gray-100)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '16px',
            color: 'var(--text-tertiary)',
          }}
        >
          {icon}
        </div>
      )}
      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{title}</h4>
      {description && (
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '280px', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  )
}
