'use client'

import { CalendarEntryWithActivity, DAY_NAMES } from '@/lib/types'
import TimeSlot from './TimeSlot'

interface DayColumnProps {
  dayIndex: number
  entries: CalendarEntryWithActivity[]
  onRemoveEntry: (entryId: string) => void
  onRepeatEntry: (entryId: string) => void
}

export default function DayColumn({ dayIndex, entries, onRemoveEntry, onRepeatEntry }: DayColumnProps) {
  const morningEntries = entries
    .filter((e) => e.time_slot === 'morning')
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const afternoonEntries = entries
    .filter((e) => e.time_slot === 'afternoon')
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  const isWeekend = dayIndex >= 5

  return (
    <div className={`flex flex-col min-w-0 ${isWeekend ? 'bg-orange-50/40' : ''} rounded-lg`}>
      {/* Day header */}
      <div className={`text-center py-1 sm:py-1.5 lg:py-2.5 font-bold text-xs sm:text-sm lg:text-base ${
        isWeekend ? 'text-orange-600' : 'text-gray-600'
      }`}>
        {DAY_NAMES[dayIndex]}
      </div>

      {/* Morning slot */}
      <div className="px-0.5 sm:px-1 lg:px-1.5 pb-0.5 flex-1 flex flex-col">
        <TimeSlot
          dayIndex={dayIndex}
          timeSlot="morning"
          entries={morningEntries}
          onRemoveEntry={onRemoveEntry}
          onRepeatEntry={onRepeatEntry}
        />
      </div>

      {/* Lunch divider */}
      <div className="lunch-divider mx-0.5 sm:mx-1 lg:mx-1.5 py-0.5 sm:py-1 lg:py-1.5 text-center rounded">
        <span className="text-[10px] sm:text-xs lg:text-sm text-orange-400">🍽😴</span>
      </div>

      {/* Afternoon slot */}
      <div className="px-0.5 sm:px-1 lg:px-1.5 pt-0.5 flex-1 flex flex-col">
        <TimeSlot
          dayIndex={dayIndex}
          timeSlot="afternoon"
          entries={afternoonEntries}
          onRemoveEntry={onRemoveEntry}
          onRepeatEntry={onRepeatEntry}
        />
      </div>
    </div>
  )
}
