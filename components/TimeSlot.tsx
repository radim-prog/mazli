'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CalendarEntryWithActivity, TimeSlot as TimeSlotType } from '@/lib/types'
import PlacedActivity from './PlacedActivity'

interface TimeSlotProps {
  dayIndex: number
  timeSlot: TimeSlotType
  entries: CalendarEntryWithActivity[]
  onRemoveEntry: (entryId: string) => void
  onRepeatEntry: (entryId: string) => void
}

export default function TimeSlot({ dayIndex, timeSlot, entries, onRemoveEntry, onRepeatEntry }: TimeSlotProps) {
  const droppableId = `${dayIndex}-${timeSlot}`
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: { dayIndex, timeSlot },
  })

  // Morning items align toward lunch (bottom), afternoon toward lunch (top)
  const alignment = timeSlot === 'morning' ? 'justify-end' : 'justify-start'

  const sortableIds = entries.map((e) => `entry-${e.id}`)

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] md:min-h-[180px] flex-1 p-1 md:p-2 rounded-lg transition-colors flex flex-col ${alignment} ${
        isOver ? 'bg-blue-100 ring-2 ring-blue-300' : 'bg-white/60'
      }`}
    >
      {/* Drop padding zone (away from lunch) */}
      <div className="min-h-[8px] md:min-h-[20px] shrink-0" />

      {/* Entries that stretch to fill */}
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className={`flex flex-col gap-1 md:gap-2 flex-1 ${alignment}`}>
          {entries.map((entry) => (
            <PlacedActivity
              key={entry.id}
              activity={entry.activity}
              entryId={entry.id}
              onRemove={onRemoveEntry}
              onRepeat={onRepeatEntry}
            />
          ))}
        </div>
      </SortableContext>

      {/* Drop padding zone (near lunch) */}
      <div className="min-h-[8px] md:min-h-[20px] shrink-0" />

      {entries.length === 0 && isOver && (
        <div className="absolute inset-0 flex items-center justify-center text-blue-300 text-2xl pointer-events-none">
          ↓
        </div>
      )}
    </div>
  )
}
