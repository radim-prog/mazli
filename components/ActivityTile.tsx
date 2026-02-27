'use client'

import { useDraggable } from '@dnd-kit/core'
import { Activity } from '@/lib/types'

interface ActivityTileProps {
  activity: Activity
}

export default function ActivityTile({ activity }: ActivityTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `activity-${activity.id}`,
    data: { activity },
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="activity-tile flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-md text-sm"
      style={{
        ...style,
        backgroundColor: activity.color + '20',
        borderLeft: `3px solid ${activity.color}`,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <span className="text-base leading-none">{activity.emoji}</span>
      <span className="font-medium text-gray-700 truncate">{activity.name}</span>
    </div>
  )
}
