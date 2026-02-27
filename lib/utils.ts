/**
 * Get the Monday of the week containing the given date.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Format date as ISO date string (YYYY-MM-DD).
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get week number of the year.
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Navigate to next/previous week.
 */
export function shiftWeek(weekStart: Date, direction: number): Date {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + direction * 7)
  return d
}

/**
 * Format week range for display, e.g. "24.2. – 2.3.2026"
 */
export function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)

  const startDay = weekStart.getDate()
  const startMonth = weekStart.getMonth() + 1
  const endDay = end.getDate()
  const endMonth = end.getMonth() + 1
  const year = end.getFullYear()

  if (startMonth === endMonth) {
    return `${startDay}.–${endDay}.${endMonth}. ${year}`
  }
  return `${startDay}.${startMonth}.–${endDay}.${endMonth}. ${year}`
}
