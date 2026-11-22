const DAY = 24 * 60 * 60 * 1000

function startOfDay(value) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function daysUntil(iso) {
  if (!iso) return 0
  return Math.round((startOfDay(iso) - startOfDay(new Date())) / DAY)
}

export function dueLabel(iso) {
  const days = daysUntil(iso)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days > 1) return `Due in ${days} days`
  if (days === -1) return 'Overdue by 1 day'
  return `Overdue by ${-days} days`
}

export function isOverdue(iso) {
  return daysUntil(iso) < 0
}

export function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

export function statusMeta(submission) {
  if (!submission) return { label: 'To do', tone: 'slate' }
  if (submission.status === 'graded') return { label: 'Graded', tone: 'emerald' }
  return { label: 'Submitted', tone: 'sky' }
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`
}
