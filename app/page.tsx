'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Activity, CalendarEntryWithActivity, Category } from '@/lib/types'
import { getWeekStart, formatDate } from '@/lib/utils'
import WeeklyCalendar from '@/components/WeeklyCalendar'
import ActivitySidebar from '@/components/ActivitySidebar'
import WeekNavigation from '@/components/WeekNavigation'
import AddActivityDialog from '@/components/AddActivityDialog'

const CATEGORY_COLORS: Record<Category, string> = {
  outdoor: '#22c55e',
  visits: '#a855f7',
  classes: '#3b82f6',
  home: '#f59e0b',
  errands: '#6b7280',
}

export default function Home() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [activities, setActivities] = useState<Activity[]>([])
  const [entries, setEntries] = useState<CalendarEntryWithActivity[]>([])
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  // Fetch activities
  useEffect(() => {
    fetch('/api/activities')
      .then((r) => r.json())
      .then(setActivities)
      .catch(console.error)
  }, [])

  // Fetch entries for current week
  const fetchEntries = useCallback(() => {
    const ws = formatDate(weekStart)
    setLoading(true)
    fetch(`/api/entries?week_start=${ws}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [weekStart])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const activity = event.active.data.current?.activity as Activity | undefined
    if (activity) setActiveActivity(activity)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveActivity(null)

    const { active, over } = event
    if (!over) return

    const activity = active.data.current?.activity as Activity | undefined
    if (!activity) return

    const dropData = over.data.current as { dayIndex: number; timeSlot: string } | undefined
    if (!dropData) return

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticEntry: CalendarEntryWithActivity = {
      id: tempId,
      activity_id: activity.id,
      week_start: formatDate(weekStart),
      day_of_week: dropData.dayIndex,
      time_slot: dropData.timeSlot as 'morning' | 'afternoon',
      created_at: new Date().toISOString(),
      activity,
    }
    setEntries((prev) => [...prev, optimisticEntry])

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: activity.id,
          week_start: formatDate(weekStart),
          day_of_week: dropData.dayIndex,
          time_slot: dropData.timeSlot,
        }),
      })
      const saved = await res.json()
      // Replace temp entry with real one
      setEntries((prev) => prev.map((e) => (e.id === tempId ? saved : e)))
    } catch {
      // Revert on error
      setEntries((prev) => prev.filter((e) => e.id !== tempId))
    }
  }

  // Remove entry
  const handleRemoveEntry = async (entryId: string) => {
    // Optimistic removal
    const removed = entries.find((e) => e.id === entryId)
    setEntries((prev) => prev.filter((e) => e.id !== entryId))

    try {
      await fetch(`/api/entries?id=${entryId}`, { method: 'DELETE' })
    } catch {
      // Revert on error
      if (removed) setEntries((prev) => [...prev, removed])
    }
  }

  // Add custom activity
  const handleAddActivity = async (data: { name: string; emoji: string; category: Category }) => {
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          color: CATEGORY_COLORS[data.category],
          sort_order: activities.length + 1,
        }),
      })
      const newActivity = await res.json()
      setActivities((prev) => [...prev, newActivity])
    } catch (err) {
      console.error('Failed to add activity:', err)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-sm border-b border-amber-200/50 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-xl font-bold text-amber-800 flex items-center gap-2">
              <span className="text-2xl">🐻</span>
              Mazlíkův týden
            </h1>
            <WeekNavigation weekStart={weekStart} onWeekChange={setWeekStart} />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-3 gap-3">
          {/* Sidebar - left on desktop, bottom on mobile */}
          <aside className="order-2 lg:order-1 lg:w-48 xl:w-56 shrink-0">
            <div className="lg:sticky lg:top-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 hidden lg:block">
                Aktivity
              </h2>
              <ActivitySidebar activities={activities} onAddClick={() => setShowAddDialog(true)} />
            </div>
          </aside>

          {/* Calendar grid */}
          <section className="order-1 lg:order-2 flex-1 min-w-0">
            {loading && entries.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <div className="text-3xl mb-2 animate-bounce">🐻</div>
                  <div className="text-sm">Načítám...</div>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 rounded-xl border border-gray-200/50 p-2 shadow-sm">
                <WeeklyCalendar entries={entries} onRemoveEntry={handleRemoveEntry} />
              </div>
            )}
          </section>
        </main>

        {/* Drag overlay */}
        <DragOverlay>
          {activeActivity ? (
            <div
              className="drag-overlay flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-lg text-sm"
              style={{
                backgroundColor: activeActivity.color + '30',
                borderLeft: `3px solid ${activeActivity.color}`,
              }}
            >
              <span className="text-base leading-none">{activeActivity.emoji}</span>
              <span className="font-medium text-gray-700">{activeActivity.name}</span>
            </div>
          ) : null}
        </DragOverlay>

        {/* Add activity dialog */}
        <AddActivityDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAddActivity}
        />
      </div>
    </DndContext>
  )
}
