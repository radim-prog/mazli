import { Client } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import type { Activity, TimeSlot } from './types'

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// Data source IDs (not database IDs) - required for v5 dataSources.query()
export const ACTIVITIES_DS = process.env.NOTION_ACTIVITIES_DS!
export const ENTRIES_DS = process.env.NOTION_ENTRIES_DS!

export function isFullPage(obj: unknown): obj is PageObjectResponse {
  return (obj as PageObjectResponse)?.object === 'page' && 'properties' in (obj as PageObjectResponse)
}

function getTitle(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop]
  return p?.type === 'title' ? (p.title[0]?.plain_text ?? '') : ''
}

function getRichText(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop]
  return p?.type === 'rich_text' ? (p.rich_text[0]?.plain_text ?? '') : ''
}

function getSelect(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop]
  return p?.type === 'select' ? (p.select?.name ?? '') : ''
}

function getNumber(page: PageObjectResponse, prop: string): number {
  const p = page.properties[prop]
  return p?.type === 'number' ? (p.number ?? 0) : 0
}

function getDate(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop]
  return p?.type === 'date' ? (p.date?.start ?? '') : ''
}

function getRelationIds(page: PageObjectResponse, prop: string): string[] {
  const p = page.properties[prop]
  return p?.type === 'relation' ? p.relation.map(r => r.id) : []
}

export function pageToActivity(page: PageObjectResponse): Activity {
  return {
    id: page.id,
    name: getTitle(page, 'Name'),
    emoji: getRichText(page, 'Emoji'),
    color: getRichText(page, 'Color'),
    category: getSelect(page, 'Category'),
    sort_order: getNumber(page, 'Sort Order'),
    created_at: page.created_time,
  }
}

export function pageToEntry(page: PageObjectResponse) {
  return {
    id: page.id,
    activity_id: getRelationIds(page, 'Activity')[0] ?? '',
    week_start: getDate(page, 'Week Start'),
    day_of_week: getNumber(page, 'Day of Week'),
    time_slot: getSelect(page, 'Time Slot') as TimeSlot,
    sort_order: getNumber(page, 'Sort Order'),
    created_at: page.created_time,
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function activityProperties(a: { name: string; emoji: string; color: string; category: string; sort_order: number }): any {
  return {
    'Name': { title: [{ text: { content: a.name } }] },
    'Emoji': { rich_text: [{ text: { content: a.emoji } }] },
    'Color': { rich_text: [{ text: { content: a.color } }] },
    'Category': { select: { name: a.category } },
    'Sort Order': { number: a.sort_order },
  }
}

export function entryProperties(e: { activity_id: string; week_start: string; day_of_week: number; time_slot: string; sort_order: number }): any {
  return {
    'Entry': { title: [{ text: { content: `${e.week_start}-d${e.day_of_week}-${e.time_slot}` } }] },
    'Activity': { relation: [{ id: e.activity_id }] },
    'Week Start': { date: { start: e.week_start } },
    'Day of Week': { number: e.day_of_week },
    'Time Slot': { select: { name: e.time_slot } },
    'Sort Order': { number: e.sort_order },
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
