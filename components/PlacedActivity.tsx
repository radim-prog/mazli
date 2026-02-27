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
      className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 rounded-xl group relative"
      style={{
        backgroundColor: activity.color + '20',
        border: `2px solid ${activity.color}35`,
      }}
    >
      <span className="text-2xl">{activity.emoji}</span>
      <span className="font-semibold text-gray-700 text-sm text-center leading-tight">{activity.name}</span>
      <button
        onClick={() => onRemove(entryId)}
        className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-400 hover:bg-red-500 text-white rounded-full text-sm flex items-center justify-center transition-opacity shadow"
        aria-label="Odebrat"
      >
        &times;
      </button>
    </div>
  )
}
