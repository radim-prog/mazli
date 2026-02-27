'use client'

import { Activity } from '@/lib/types'

interface PlacedActivityProps {
  activity: Activity
  entryId: string
  onRemove: (entryId: string) => void
}

export default function PlacedActivity({ activity, entryId, onRemove }: PlacedActivityProps) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm group"
      style={{
        backgroundColor: activity.color + '25',
        border: `1px solid ${activity.color}40`,
      }}
    >
      <span className="text-lg leading-none">{activity.emoji}</span>
      <span className="font-medium text-gray-700 truncate flex-1">{activity.name}</span>
      <button
        onClick={() => onRemove(entryId)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-0.5 text-xl leading-none p-1"
        aria-label="Odebrat"
      >
        &times;
      </button>
    </div>
  )
}
