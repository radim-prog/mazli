import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import type { Activity, CalendarEntryWithActivity, TimeSlot } from './types'

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'mazli.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (!_db) {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')

    _db.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        emoji TEXT DEFAULT '',
        color TEXT DEFAULT '',
        category TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        week_start TEXT NOT NULL,
        day_of_week INTEGER NOT NULL,
        time_slot TEXT NOT NULL CHECK(time_slot IN ('morning','afternoon')),
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_entries_week ON entries(week_start);
      CREATE INDEX IF NOT EXISTS idx_entries_activity ON entries(activity_id);
    `)
  }
  return _db
}

function generateId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function getAllActivities(): Activity[] {
  return getDb()
    .prepare('SELECT * FROM activities ORDER BY sort_order ASC, created_at ASC')
    .all() as Activity[]
}

export function createActivity(a: { name: string; emoji: string; color: string; category: string; sort_order: number }): Activity {
  const id = generateId()
  const now = new Date().toISOString()
  getDb().prepare(
    'INSERT INTO activities (id, name, emoji, color, category, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, a.name, a.emoji, a.color, a.category, a.sort_order, now)
  return { id, ...a, created_at: now }
}

export function updateActivity(id: string, a: { name: string; emoji: string; color: string; category: string }): Activity | null {
  getDb().prepare(
    'UPDATE activities SET name = ?, emoji = ?, color = ?, category = ? WHERE id = ?'
  ).run(a.name, a.emoji, a.color, a.category, id)
  return getDb().prepare('SELECT * FROM activities WHERE id = ?').get(id) as Activity | null
}

export function deleteActivity(id: string): void {
  const db = getDb()
  db.prepare('DELETE FROM entries WHERE activity_id = ?').run(id)
  db.prepare('DELETE FROM activities WHERE id = ?').run(id)
}

function rowToEntryWithActivity(row: Record<string, unknown>): CalendarEntryWithActivity {
  return {
    id: row.id as string,
    activity_id: row.activity_id as string,
    week_start: row.week_start as string,
    day_of_week: row.day_of_week as number,
    time_slot: row.time_slot as TimeSlot,
    sort_order: row.sort_order as number,
    created_at: row.created_at as string,
    activity: {
      id: row.activity_id as string,
      name: row.activity_name as string,
      emoji: row.activity_emoji as string,
      color: row.activity_color as string,
      category: row.activity_category as string,
      sort_order: row.activity_sort_order as number,
      created_at: row.activity_created_at as string,
    },
  }
}

const ENTRY_JOIN_QUERY = `
  SELECT e.*, a.name AS activity_name, a.emoji AS activity_emoji,
         a.color AS activity_color, a.category AS activity_category,
         a.sort_order AS activity_sort_order, a.created_at AS activity_created_at
  FROM entries e
  JOIN activities a ON e.activity_id = a.id
`

export function getEntriesByWeek(weekStart: string): CalendarEntryWithActivity[] {
  return (getDb().prepare(
    `${ENTRY_JOIN_QUERY} WHERE e.week_start = ? ORDER BY e.sort_order ASC, e.created_at ASC`
  ).all(weekStart) as Record<string, unknown>[]).map(rowToEntryWithActivity)
}

export function createEntry(e: { activity_id: string; week_start: string; day_of_week: number; time_slot: string; sort_order: number }): CalendarEntryWithActivity | null {
  const id = generateId()
  const now = new Date().toISOString()
  getDb().prepare(
    'INSERT INTO entries (id, activity_id, week_start, day_of_week, time_slot, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, e.activity_id, e.week_start, e.day_of_week, e.time_slot, e.sort_order, now)

  const row = getDb().prepare(`${ENTRY_JOIN_QUERY} WHERE e.id = ?`).get(id) as Record<string, unknown> | undefined
  if (!row) return null
  return rowToEntryWithActivity(row)
}

export function createEntriesBatch(items: { activity_id: string; week_start: string; day_of_week: number; time_slot: string }[]): CalendarEntryWithActivity[] {
  const db = getDb()
  const insert = db.prepare(
    'INSERT INTO entries (id, activity_id, week_start, day_of_week, time_slot, sort_order, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)'
  )
  const ids: string[] = []

  db.transaction(() => {
    for (const item of items) {
      const id = generateId()
      insert.run(id, item.activity_id, item.week_start, item.day_of_week, item.time_slot, new Date().toISOString())
      ids.push(id)
    }
  })()

  const placeholders = ids.map(() => '?').join(',')
  return (db.prepare(
    `${ENTRY_JOIN_QUERY} WHERE e.id IN (${placeholders})`
  ).all(...ids) as Record<string, unknown>[]).map(rowToEntryWithActivity)
}

export function updateEntry(id: string, updates: { day_of_week?: number; time_slot?: string; sort_order?: number }): CalendarEntryWithActivity | null {
  const db = getDb()
  const sets: string[] = []
  const values: unknown[] = []
  if (updates.day_of_week !== undefined) { sets.push('day_of_week = ?'); values.push(updates.day_of_week) }
  if (updates.time_slot !== undefined) { sets.push('time_slot = ?'); values.push(updates.time_slot) }
  if (updates.sort_order !== undefined) { sets.push('sort_order = ?'); values.push(updates.sort_order) }
  if (sets.length === 0) return null

  values.push(id)
  db.prepare(`UPDATE entries SET ${sets.join(', ')} WHERE id = ?`).run(...values)

  const row = db.prepare(`${ENTRY_JOIN_QUERY} WHERE e.id = ?`).get(id) as Record<string, unknown> | undefined
  if (!row) return null
  return rowToEntryWithActivity(row)
}

export function reorderEntries(items: { id: string; sort_order: number }[]): void {
  const db = getDb()
  const stmt = db.prepare('UPDATE entries SET sort_order = ? WHERE id = ?')
  db.transaction(() => {
    for (const item of items) stmt.run(item.sort_order, item.id)
  })()
}

export function deleteEntry(id: string): void {
  getDb().prepare('DELETE FROM entries WHERE id = ?').run(id)
}

export function seedDefaults(defaults: { name: string; emoji: string; color: string; category: string; sort_order: number }[]): Activity[] {
  const db = getDb()
  const insert = db.prepare(
    'INSERT INTO activities (id, name, emoji, color, category, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  const results: Activity[] = []
  db.transaction(() => {
    for (const a of defaults) {
      const id = generateId()
      const now = new Date().toISOString()
      insert.run(id, a.name, a.emoji, a.color, a.category, a.sort_order, now)
      results.push({ id, ...a, created_at: now })
    }
  })()
  return results
}
