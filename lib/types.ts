export type TimeSlot = 'morning' | 'afternoon'

export interface Activity {
  id: string
  name: string
  emoji: string
  color: string
  category: string
  sort_order: number
  created_at: string
}

export interface CalendarEntry {
  id: string
  activity_id: string
  week_start: string // ISO date string (Monday)
  day_of_week: number // 0=Mon, 6=Sun
  time_slot: TimeSlot
  created_at: string
}

export interface CalendarEntryWithActivity extends CalendarEntry {
  activity: Activity
}

export const DEFAULT_CATEGORIES: Record<string, { label: string; color: string }> = {
  outdoor: { label: 'Venku', color: '#22c55e' },
  visits: { label: 'Návštěvy', color: '#a855f7' },
  classes: { label: 'Kroužky', color: '#3b82f6' },
  home: { label: 'Doma', color: '#f59e0b' },
  errands: { label: 'Pochůzky', color: '#6b7280' },
}

export const DAY_NAMES = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'] as const

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: 'Dopoledne',
  afternoon: 'Odpoledne',
}
