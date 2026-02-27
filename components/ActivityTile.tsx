'use client'

import { useDraggable } from '@dnd-kit/core'
import { Activity } from '@/lib/types'

interface ActivityTileProps {
  activity: Activity
  onDelete?: (id: string) => void
}

export default function ActivityTile({ activity, onDelete }: ActivityTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `activity-${activity.id}`,
    data: { activity },
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      className="group relative flex items-center"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="activity-tile flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-md text-sm flex-1"
        style={{
          ...style,
          backgroundColor: activity.color + '20',
          borderLeft: `3px solid ${activity.color}`,
        }}
      >
        <span className="text-base leading-none">{activity.emoji}</span>
        <span className="font-medium text-gray-700 truncate">{activity.name}</span>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(activity.id)
          }}
          className="opacity-0 group-hover:opacity-100 absolute -right-1 -top-1 w-5 h-5 bg-red-400 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center transition-opacity shadow-sm"
          aria-label="Smazat aktivitu"
        >
          &times;
        </button>
      )}
    </div>
  )
}
