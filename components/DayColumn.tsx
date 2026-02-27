'use client'

import { CalendarEntryWithActivity, DAY_NAMES } from '@/lib/types'
import TimeSlot from './TimeSlot'

interface DayColumnProps {
  dayIndex: number
  entries: CalendarEntryWithActivity[]
  onRemoveEntry: (entryId: string) => void
}

export default function DayColumn({ dayIndex, entries, onRemoveEntry }: DayColumnProps) {
  const morningEntries = entries.filter((e) => e.time_slot === 'morning')
  const afternoonEntries = entries.filter((e) => e.time_slot === 'afternoon')

  const isWeekend = dayIndex >= 5

  return (
    <div className={`flex flex-col min-w-[100px] ${isWeekend ? 'bg-orange-50/40' : ''} rounded-lg`}>
      {/* Day header */}
      <div className={`text-center py-2.5 font-bold text-base ${
        isWeekend ? 'text-orange-600' : 'text-gray-600'
      }`}>
        {DAY_NAMES[dayIndex]}
      </div>

      {/* Morning slot */}
      <div className="px-1.5 pb-1 flex-1 flex flex-col">
        <TimeSlot
          dayIndex={dayIndex}
          timeSlot="morning"
          entries={morningEntries}
          onRemoveEntry={onRemoveEntry}
        />
      </div>

      {/* Lunch divider */}
      <div className="lunch-divider mx-1.5 py-1.5 text-center rounded">
        <span className="text-sm text-orange-400">🍽 😴</span>
      </div>

      {/* Afternoon slot */}
      <div className="px-1.5 pt-1 flex-1 flex flex-col">
        <TimeSlot
          dayIndex={dayIndex}
          timeSlot="afternoon"
          entries={afternoonEntries}
          onRemoveEntry={onRemoveEntry}
        />
      </div>
    </div>
  )
}
