import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns'

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a')
}

export function dueDateLabel(date: string | Date): { text: string; urgent: boolean } {
  const d = new Date(date)
  if (isToday(d)) return { text: 'Due today', urgent: true }
  if (isTomorrow(d)) return { text: 'Due tomorrow', urgent: false }
  if (isPast(d)) return { text: `Overdue · ${formatDate(d)}`, urgent: true }
  return { text: `Due ${formatDate(d)}`, urgent: false }
}
