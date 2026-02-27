'use client'

import { useState } from 'react'
import { Activity, DEFAULT_CATEGORIES } from '@/lib/types'
import ActivityTile from './ActivityTile'

interface ActivitySidebarProps {
  activities: Activity[]
  onAddClick: () => void
  onEditActivity: (activity: Activity) => void
  onDeleteActivity: (id: string) => void
}

export default function ActivitySidebar({ activities, onAddClick, onEditActivity, onDeleteActivity }: ActivitySidebarProps) {
  const [editMode, setEditMode] = useState(false)

  const grouped = activities.reduce<Record<string, Activity[]>>((acc, act) => {
    if (!acc[act.category]) acc[act.category] = []
    acc[act.category].push(act)
    return acc
  }, {})

  const defaultOrder = Object.keys(DEFAULT_CATEGORIES)
  const customCategories = Object.keys(grouped).filter((c) => !defaultOrder.includes(c))
  const categoryOrder = [...defaultOrder, ...customCategories]

  const getCategoryLabel = (cat: string) => DEFAULT_CATEGORIES[cat]?.label ?? cat
  const getCategoryColor = (cat: string) => {
    if (DEFAULT_CATEGORIES[cat]) return DEFAULT_CATEGORIES[cat].color
    return grouped[cat]?.[0]?.color ?? '#6b7280'
  }

  return (
    <div className="sidebar-scroll flex flex-col gap-3 overflow-y-auto lg:overflow-y-auto lg:max-h-[calc(100vh-120px)] overflow-x-auto lg:overflow-x-visible pb-2">
      {categoryOrder.map((cat) => {
        const items = grouped[cat]
        if (!items || items.length === 0) return null
        return (
          <div key={cat}>
            <div
              className="text-xs font-semibold uppercase tracking-wide mb-1.5 px-1"
              style={{ color: getCategoryColor(cat) }}
            >
              {getCategoryLabel(cat)}
            </div>
            <div className="flex lg:flex-col gap-1.5 flex-row flex-nowrap lg:flex-wrap">
              {items.map((activity) => (
                <ActivityTile
                  key={activity.id}
                  activity={activity}
                  onEdit={editMode ? onEditActivity : undefined}
                  onDelete={editMode ? onDeleteActivity : undefined}
                />
              ))}
            </div>
          </div>
        )
      })}

      <div className="flex gap-1.5 mt-1">
        <button
          onClick={onAddClick}
          className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors text-sm cursor-pointer"
        >
          <span className="text-lg leading-none">+</span>
          <span>Přidat</span>
        </button>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-2.5 py-1.5 rounded-lg border-2 text-sm cursor-pointer transition-colors ${
            editMode
              ? 'border-red-300 bg-red-50 text-red-500'
              : 'border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500'
          }`}
          title={editMode ? 'Hotovo' : 'Upravit aktivity'}
        >
          {editMode ? '✓' : '✏️'}
        </button>
      </div>
    </div>
  )
}
