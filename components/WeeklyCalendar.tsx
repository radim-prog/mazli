'use client'

import { CalendarEntryWithActivity } from '@/lib/types'
import DayColumn from './DayColumn'

interface WeeklyCalendarProps {
  entries: CalendarEntryWithActivity[]
  onRemoveEntry: (entryId: string) => void
}

export default function WeeklyCalendar({ entries, onRemoveEntry }: WeeklyCalendarProps) {
  return (
    <div className="grid grid-cols-7 gap-1 flex-1">
      {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
        <DayColumn
          key={dayIndex}
          dayIndex={dayIndex}
          entries={entries.filter((e) => e.day_of_week === dayIndex)}
          onRemoveEntry={onRemoveEntry}
        />
      ))}
    </div>
  )
}
