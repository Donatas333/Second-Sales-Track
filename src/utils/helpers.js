export function formatRelativeDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((dateStart - todayStart) / 86400000)

  if (diffDays === 0) return 'Šiandien'
  if (diffDays === 1) return 'Rytoj'
  if (diffDays === -1) return 'Vakar'
  if (diffDays > 0) return `Po ${diffDays} d.`
  return `Prieš ${Math.abs(diffDays)} d.`
}

export function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('lt-LT', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateDisplay(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('lt-LT', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function isOverdue(isoString) {
  if (!isoString) return false
  return new Date(isoString) < new Date()
}

export function isToday(isoString) {
  if (!isoString) return false
  const d = new Date(isoString)
  const now = new Date()
  return d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
}

export function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.getDate() === db.getDate() &&
    da.getMonth() === db.getMonth() &&
    da.getFullYear() === db.getFullYear()
}

export function getClientInitials(companyName) {
  if (!companyName) return '??'
  const stripped = companyName.replace(/^(UAB|MB|AB|IĮ)\s+/i, '')
  const words = stripped.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return stripped.substring(0, 2).toUpperCase()
}

export function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Labas rytas'
  if (h < 18) return 'Laba diena'
  return 'Labas vakaras'
}

export function groupByDate(items, dateField = 'date') {
  const groups = {}
  items.forEach(item => {
    const d = new Date(item[dateField])
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
}

export function getMonthName(month, year) {
  return new Date(year, month, 1).toLocaleDateString('lt-LT', { month: 'long', year: 'numeric' })
}

export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let startDow = firstDay.getDay() // 0=Sun
  if (startDow === 0) startDow = 7
  startDow -= 1 // Monday-first: 0=Mon
  const days = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)
  return days
}

export const INTERACTION_TYPES = [
  { value: 'visit', label: 'Vizitas', icon: '🤝', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  { value: 'phone', label: 'Skambutis', icon: '📞', color: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/30' },
  { value: 'email', label: 'El. paštas', icon: '✉️', color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/30' },
  { value: 'other', label: 'Kita', icon: '💬', color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/30' },
]

export function getTypeInfo(type) {
  return INTERACTION_TYPES.find(t => t.value === type) || INTERACTION_TYPES[3]
}
