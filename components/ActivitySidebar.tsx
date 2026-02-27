'use client'

import { Activity, Category, CATEGORY_LABELS } from '@/lib/types'
import ActivityTile from './ActivityTile'

interface ActivitySidebarProps {
  activities: Activity[]
  onAddClick: () => void
}

export default function ActivitySidebar({ activities, onAddClick }: ActivitySidebarProps) {
  const grouped = activities.reduce<Record<string, Activity[]>>((acc, act) => {
    if (!acc[act.category]) acc[act.category] = []
    acc[act.category].push(act)
    return acc
  }, {})

  const categoryOrder: Category[] = ['outdoor', 'visits', 'classes', 'home', 'errands']

  return (
    <div className="sidebar-scroll flex flex-col gap-3 overflow-y-auto lg:overflow-y-auto lg:max-h-[calc(100vh-120px)] overflow-x-auto lg:overflow-x-visible pb-2">
      {categoryOrder.map((cat) => {
        const items = grouped[cat]
        if (!items || items.length === 0) return null
        return (
          <div key={cat}>
            <div
              className="text-xs font-semibold uppercase tracking-wide mb-1.5 px-1"
              style={{ color: items[0].color }}
            >
              {CATEGORY_LABELS[cat]}
            </div>
            <div className="flex lg:flex-col gap-1.5 flex-row flex-nowrap lg:flex-wrap">
              {items.map((activity) => (
                <ActivityTile key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )
      })}

      <button
        onClick={onAddClick}
        className="mt-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors text-sm cursor-pointer"
      >
        <span className="text-lg leading-none">+</span>
        <span>Přidat</span>
      </button>
    </div>
  )
}
