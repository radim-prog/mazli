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
  closestCenter,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Activity, CalendarEntryWithActivity } from '@/lib/types'
import { getWeekStart, formatDate } from '@/lib/utils'
import WeeklyCalendar from '@/components/WeeklyCalendar'
import ActivitySidebar from '@/components/ActivitySidebar'
import WeekNavigation from '@/components/WeekNavigation'
import AddActivityDialog from '@/components/AddActivityDialog'
import RepeatDialog from '@/components/RepeatDialog'

export default function Home() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [activities, setActivities] = useState<Activity[]>([])
  const [entries, setEntries] = useState<CalendarEntryWithActivity[]>([])
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [repeatEntryId, setRepeatEntryId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 10 } })
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

    const isMove = active.data.current?.isMove === true
    const existingEntryId = active.data.current?.entryId as string | undefined

    // Check if dropping onto another sortable entry (reorder within slot)
    const overIdStr = String(over.id)
    const activeIdStr = String(active.id)
    const isOverEntry = overIdStr.startsWith('entry-')
    const isActiveEntry = activeIdStr.startsWith('entry-')

    if (isMove && existingEntryId && isOverEntry && isActiveEntry && activeIdStr !== overIdStr) {
      // Same-slot reorder: both active and over are entries
      const overEntryId = overIdStr.replace('entry-', '')
      const activeEntry = entries.find((e) => e.id === existingEntryId)
      const overEntry = entries.find((e) => e.id === overEntryId)

      if (activeEntry && overEntry &&
          activeEntry.day_of_week === overEntry.day_of_week &&
          activeEntry.time_slot === overEntry.time_slot) {
        // Get entries in this slot, sorted by current sort_order
        const slotEntries = entries
          .filter((e) => e.day_of_week === activeEntry.day_of_week && e.time_slot === activeEntry.time_slot)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

        const oldIndex = slotEntries.findIndex((e) => e.id === existingEntryId)
        const newIndex = slotEntries.findIndex((e) => e.id === overEntryId)

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(slotEntries, oldIndex, newIndex)
          const reorderUpdates = reordered.map((e, i) => ({ id: e.id, sort_order: i }))

          // Optimistic update
          setEntries((prev) => {
            const updated = [...prev]
            for (const upd of reorderUpdates) {
              const idx = updated.findIndex((e) => e.id === upd.id)
              if (idx !== -1) updated[idx] = { ...updated[idx], sort_order: upd.sort_order }
            }
            return updated
          })

          try {
            await fetch('/api/entries', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reorder: reorderUpdates }),
            })
          } catch {
            // Revert on error
            fetchEntries()
          }
        }
        return
      }
    }

    // Determine drop target slot (could be a droppable zone or another entry)
    let dropDayIndex: number | undefined
    let dropTimeSlot: string | undefined

    if (isOverEntry) {
      // Dropped on another entry - use that entry's slot
      const overEntryId = overIdStr.replace('entry-', '')
      const overEntry = entries.find((e) => e.id === overEntryId)
      if (overEntry) {
        dropDayIndex = overEntry.day_of_week
        dropTimeSlot = overEntry.time_slot
      }
    } else {
      // Dropped on a droppable zone
      const dropData = over.data.current as { dayIndex: number; timeSlot: string } | undefined
      if (dropData) {
        dropDayIndex = dropData.dayIndex
        dropTimeSlot = dropData.timeSlot
      }
    }

    if (dropDayIndex === undefined || dropTimeSlot === undefined) return

    if (isMove && existingEntryId) {
      // Moving an existing entry to a different slot
      const oldEntry = entries.find((e) => e.id === existingEntryId)
      if (!oldEntry) return

      // Skip if dropped on the same slot
      if (oldEntry.day_of_week === dropDayIndex && oldEntry.time_slot === dropTimeSlot) return

      // Optimistic update
      setEntries((prev) =>
        prev.map((e) =>
          e.id === existingEntryId
            ? { ...e, day_of_week: dropDayIndex!, time_slot: dropTimeSlot as 'morning' | 'afternoon' }
            : e
        )
      )

      try {
        const res = await fetch('/api/entries', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingEntryId,
            day_of_week: dropDayIndex,
            time_slot: dropTimeSlot,
          }),
        })
        const saved = await res.json()
        setEntries((prev) => prev.map((e) => (e.id === existingEntryId ? saved : e)))
      } catch {
        if (oldEntry) setEntries((prev) => prev.map((e) => (e.id === existingEntryId ? oldEntry : e)))
      }
    } else {
      // New entry from sidebar
      const tempId = `temp-${Date.now()}`
      const optimisticEntry: CalendarEntryWithActivity = {
        id: tempId,
        activity_id: activity.id,
        week_start: formatDate(weekStart),
        day_of_week: dropDayIndex,
        time_slot: dropTimeSlot as 'morning' | 'afternoon',
        sort_order: 0,
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
            day_of_week: dropDayIndex,
            time_slot: dropTimeSlot,
          }),
        })
        const saved = await res.json()
        setEntries((prev) => prev.map((e) => (e.id === tempId ? saved : e)))
      } catch {
        setEntries((prev) => prev.filter((e) => e.id !== tempId))
      }
    }
  }

  // Remove calendar entry
  const handleRemoveEntry = async (entryId: string) => {
    const removed = entries.find((e) => e.id === entryId)
    setEntries((prev) => prev.filter((e) => e.id !== entryId))

    try {
      await fetch(`/api/entries?id=${entryId}`, { method: 'DELETE' })
    } catch {
      if (removed) setEntries((prev) => [...prev, removed])
    }
  }

  // Delete activity from sidebar
  const handleDeleteActivity = async (activityId: string) => {
    const removed = activities.find((a) => a.id === activityId)
    setActivities((prev) => prev.filter((a) => a.id !== activityId))
    // Also remove any calendar entries for this activity
    setEntries((prev) => prev.filter((e) => e.activity_id !== activityId))

    try {
      await fetch(`/api/activities?id=${activityId}`, { method: 'DELETE' })
    } catch {
      if (removed) setActivities((prev) => [...prev, removed])
    }
  }

  // Edit existing activity
  const handleEditActivity = async (id: string, data: { name: string; emoji: string; category: string; color: string }) => {
    const old = activities.find((a) => a.id === id)
    // Optimistic
    setActivities((prev) => prev.map((a) => a.id === id ? { ...a, ...data } : a))
    setEntries((prev) => prev.map((e) => e.activity_id === id ? { ...e, activity: { ...e.activity, ...data } } : e))

    try {
      const res = await fetch('/api/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const updated = await res.json()
      setActivities((prev) => prev.map((a) => a.id === id ? updated : a))
    } catch {
      if (old) setActivities((prev) => prev.map((a) => a.id === id ? old : a))
    }
  }

  // Add custom activity
  const handleAddActivity = async (data: { name: string; emoji: string; category: string; color: string }) => {
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          sort_order: activities.length + 1,
        }),
      })
      const newActivity = await res.json()
      setActivities((prev) => [...prev, newActivity])
    } catch (err) {
      console.error('Failed to add activity:', err)
    }
  }

  // Repeat entry to future weeks
  const handleRepeatEntry = async (weeks: number) => {
    if (!repeatEntryId) return
    const entry = entries.find((e) => e.id === repeatEntryId)
    if (!entry) return

    setRepeatEntryId(null)

    // Calculate future week_start dates
    const baseWeekStart = new Date(entry.week_start + 'T00:00:00')
    const batch = []
    for (let i = 1; i <= weeks; i++) {
      const futureWeek = new Date(baseWeekStart)
      futureWeek.setDate(futureWeek.getDate() + i * 7)
      batch.push({
        activity_id: entry.activity_id,
        week_start: formatDate(futureWeek),
        day_of_week: entry.day_of_week,
        time_slot: entry.time_slot,
      })
    }

    try {
      await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch }),
      })
    } catch (err) {
      console.error('Failed to repeat entry:', err)
    }
  }

  const repeatEntry = repeatEntryId ? entries.find((e) => e.id === repeatEntryId) : null

  // Collect existing categories
  const existingCategories = [...new Set(activities.map((a) => a.category))]

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-dvh flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-sm border-b border-amber-200/50 px-2 md:px-4 py-1.5 md:py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 md:gap-2">
            <h1 className="text-sm md:text-xl font-bold text-amber-800 flex items-center gap-1 md:gap-2 shrink-0">
              <span className="text-base md:text-2xl">🐻</span>
              <span className="hidden md:inline">Mazlinčin týden</span>
              <span className="md:hidden">Mazlinka</span>
            </h1>
            <WeekNavigation weekStart={weekStart} onWeekChange={setWeekStart} />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 min-h-0 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-1 md:p-3 gap-1 md:gap-3">
          {/* Sidebar - hidden on mobile, overlay drawer */}
          <aside className="hidden lg:block lg:order-1 lg:w-48 xl:w-56 shrink-0">
            <div className="lg:sticky lg:top-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Aktivity
              </h2>
              <ActivitySidebar
                activities={activities}
                onAddClick={() => { setEditingActivity(null); setShowAddDialog(true) }}
                onEditActivity={(a) => { setEditingActivity(a); setShowAddDialog(true) }}
                onDeleteActivity={handleDeleteActivity}
              />
            </div>
          </aside>

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-40 flex" onClick={() => setSidebarOpen(false)}>
              <div className="absolute inset-0 bg-black/30" />
              <div
                className="relative ml-auto w-64 max-w-[80vw] bg-white h-full shadow-xl p-3 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-600">Aktivity</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg"
                  >
                    &times;
                  </button>
                </div>
                <ActivitySidebar
                  activities={activities}
                  onAddClick={() => { setEditingActivity(null); setShowAddDialog(true); setSidebarOpen(false) }}
                  onEditActivity={(a) => { setEditingActivity(a); setShowAddDialog(true); setSidebarOpen(false) }}
                  onDeleteActivity={handleDeleteActivity}
                />
              </div>
            </div>
          )}

          {/* Calendar grid */}
          <section className="flex-1 min-h-0 min-w-0 lg:order-2">
            {loading && entries.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2 animate-bounce">🐻</div>
                  <div className="text-sm">Načítám...</div>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 rounded-lg md:rounded-xl border border-gray-200/50 shadow-sm relative h-full">
                <div className="absolute inset-0 overflow-x-auto p-1 md:p-3">
                  <WeeklyCalendar entries={entries} onRemoveEntry={handleRemoveEntry} onRepeatEntry={setRepeatEntryId} />
                </div>
              </div>
            )}
          </section>
        </main>

        {/* Mobile: floating button to open sidebar */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-3 left-3 z-30 w-12 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl active:scale-95 transition-transform"
          aria-label="Aktivity"
        >
          +
        </button>

        {/* Drag overlay */}
        <DragOverlay>
          {activeActivity ? (
            <div
              className="drag-overlay flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-base"
              style={{
                backgroundColor: activeActivity.color + '30',
                borderLeft: `3px solid ${activeActivity.color}`,
              }}
            >
              <span className="text-2xl" role="img">{activeActivity.emoji}</span>
              <span className="font-medium text-gray-700">{activeActivity.name}</span>
            </div>
          ) : null}
        </DragOverlay>

        {/* Add activity dialog */}
        <AddActivityDialog
          isOpen={showAddDialog}
          existingCategories={existingCategories}
          editingActivity={editingActivity}
          onClose={() => { setShowAddDialog(false); setEditingActivity(null) }}
          onAdd={handleAddActivity}
          onEdit={handleEditActivity}
        />

        {/* Repeat dialog */}
        {repeatEntry && (
          <RepeatDialog
            activityName={repeatEntry.activity.name}
            activityEmoji={repeatEntry.activity.emoji}
            onConfirm={handleRepeatEntry}
            onClose={() => setRepeatEntryId(null)}
          />
        )}

        {/* Auto-save indicator */}
        <div className="fixed bottom-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full shadow-sm">
          Automatické ukládání
        </div>
      </div>
    </DndContext>
  )
}
