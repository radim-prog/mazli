'use client'

import { useDraggable } from '@dnd-kit/core'
import { Activity } from '@/lib/types'

interface ActivityTileProps {
  activity: Activity
  onEdit?: (activity: Activity) => void
  onDelete?: (id: string) => void
}

export default function ActivityTile({ activity, onEdit, onDelete }: ActivityTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `activity-${activity.id}`,
    data: { activity },
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  const isEditMode = !!onEdit || !!onDelete

  return (
    <div
      className="group relative flex items-center"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        ref={setNodeRef}
        {...(isEditMode ? {} : listeners)}
        {...(isEditMode ? {} : attributes)}
        className={`activity-tile flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2.5 py-1 md:py-1.5 rounded-lg select-none transition-shadow hover:shadow-md text-xs md:text-sm flex-1 ${
          isEditMode ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
        style={{
          ...style,
          backgroundColor: activity.color + '20',
          borderLeft: `3px solid ${activity.color}`,
        }}
      >
        <span className="text-base md:text-xl shrink-0" role="img">{activity.emoji}</span>
        <span className="font-medium text-gray-700 truncate">{activity.name}</span>
      </div>
      {isEditMode && (
        <div className="flex gap-0.5 ml-0.5 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(activity)}
              className="w-6 h-6 bg-blue-400 hover:bg-blue-500 text-white rounded-full text-xs flex items-center justify-center shadow-sm"
              aria-label="Upravit"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(activity.id)}
              className="w-6 h-6 bg-red-400 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-sm"
              aria-label="Smazat"
            >
              &times;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
