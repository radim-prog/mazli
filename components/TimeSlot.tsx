'use client'

import { useDroppable } from '@dnd-kit/core'
import { CalendarEntryWithActivity, TimeSlot as TimeSlotType } from '@/lib/types'
import PlacedActivity from './PlacedActivity'

interface TimeSlotProps {
  dayIndex: number
  timeSlot: TimeSlotType
  entries: CalendarEntryWithActivity[]
  onRemoveEntry: (entryId: string) => void
}

export default function TimeSlot({ dayIndex, timeSlot, entries, onRemoveEntry }: TimeSlotProps) {
  const droppableId = `${dayIndex}-${timeSlot}`
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: { dayIndex, timeSlot },
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] p-1.5 rounded-md transition-colors flex flex-col gap-1 ${
        isOver ? 'bg-blue-100 ring-2 ring-blue-300' : 'bg-white/60'
      }`}
    >
      {entries.map((entry) => (
        <PlacedActivity
          key={entry.id}
          activity={entry.activity}
          entryId={entry.id}
          onRemove={onRemoveEntry}
        />
      ))}
      {entries.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-300 text-xs">
          {isOver ? '↓' : ''}
        </div>
      )}
    </div>
  )
}
