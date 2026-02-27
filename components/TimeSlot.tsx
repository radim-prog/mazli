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

  // Morning items align toward lunch (bottom), afternoon toward lunch (top)
  const alignment = timeSlot === 'morning' ? 'justify-end' : 'justify-start'

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[180px] flex-1 p-2 rounded-lg transition-colors flex flex-col gap-2 ${alignment} ${
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
      {entries.length === 0 && isOver && (
        <div className="flex-1 flex items-center justify-center text-blue-300 text-2xl">
          ↓
        </div>
      )}
    </div>
  )
}
