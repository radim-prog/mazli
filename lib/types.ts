export type Category = 'outdoor' | 'visits' | 'classes' | 'home' | 'errands'

export type TimeSlot = 'morning' | 'afternoon'

export interface Activity {
  id: string
  name: string
  emoji: string
  color: string
  category: Category
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

export const CATEGORY_LABELS: Record<Category, string> = {
  outdoor: 'Venku',
  visits: 'Návštěvy',
  classes: 'Kroužky',
  home: 'Doma',
  errands: 'Pochůzky',
}

export const DAY_NAMES = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'] as const

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: 'Dopoledne',
  afternoon: 'Odpoledne',
}
