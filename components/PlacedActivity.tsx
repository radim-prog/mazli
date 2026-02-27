'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Activity } from '@/lib/types'

interface PlacedActivityProps {
  activity: Activity
  entryId: string
  onRemove: (entryId: string) => void
  onRepeat: (entryId: string) => void
}

export default function PlacedActivity({ activity, entryId, onRemove, onRepeat }: PlacedActivityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `entry-${entryId}`,
    data: { activity, entryId, isMove: true },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    backgroundColor: activity.color + '20',
    border: `2px solid ${activity.color}35`,
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="activity-tile flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl group relative cursor-grab active:cursor-grabbing select-none min-h-0"
      style={style}
    >
      <span className="text-4xl" role="img">{activity.emoji}</span>
      <span className="font-semibold text-gray-700 text-base text-center leading-tight">{activity.name}</span>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onRemove(entryId)
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-400 hover:bg-red-500 text-white rounded-full text-sm flex items-center justify-center transition-opacity shadow"
        aria-label="Odebrat"
      >
        &times;
      </button>

      {/* Repeat button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onRepeat(entryId)
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -left-1.5 w-6 h-6 bg-blue-400 hover:bg-blue-500 text-white rounded-full text-xs flex items-center justify-center transition-opacity shadow"
        aria-label="Opakovat"
      >
        🔁
      </button>
    </div>
  )
}
