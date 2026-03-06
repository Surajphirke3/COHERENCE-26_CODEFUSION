interface StatusBadgeProps {
  status: string
  variant?: 'project' | 'task' | 'priority'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Project statuses
  active: { label: 'Active', className: 'badge-success' },
  paused: { label: 'Paused', className: 'badge-warning' },
  // Task statuses — using exact per-status badge classes
  todo: { label: 'To Do', className: 'badge-todo' },
  in_progress: { label: 'In Progress', className: 'badge-in-progress' },
  review: { label: 'Review', className: 'badge-review' },
  done: { label: 'Done', className: 'badge-done' },
  // Priorities
  low: { label: 'Low', className: 'badge-neutral' },
  medium: { label: 'Medium', className: 'badge-warning' },
  high: { label: 'High', className: 'badge-danger' },
  urgent: { label: 'Urgent', className: 'badge-danger' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'badge-neutral' }

  return <span className={`badge ${config.className}`}>{config.label}</span>
}
