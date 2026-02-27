'use client'

import { CalendarEntryWithActivity } from '@/lib/types'
import DayColumn from './DayColumn'

interface WeeklyCalendarProps {
  entries: CalendarEntryWithActivity[]
  onRemoveEntry: (entryId: string) => void
  onRepeatEntry: (entryId: string) => void
}

export default function WeeklyCalendar({ entries, onRemoveEntry, onRepeatEntry }: WeeklyCalendarProps) {
  return (
    <div className="overflow-x-auto flex-1 h-full">
      <div className="grid grid-cols-7 gap-0.5 md:gap-1.5 h-full min-w-[500px]">
        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
          <DayColumn
            key={dayIndex}
            dayIndex={dayIndex}
            entries={entries.filter((e) => e.day_of_week === dayIndex)}
            onRemoveEntry={onRemoveEntry}
            onRepeatEntry={onRepeatEntry}
          />
        ))}
      </div>
    </div>
  )
}
