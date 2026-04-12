import { NextRequest, NextResponse } from 'next/server'
import { getEntriesByWeek, createEntry, createEntriesBatch, updateEntry, reorderEntries, deleteEntry } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const weekStart = request.nextUrl.searchParams.get('week_start')
    if (!weekStart) {
      return NextResponse.json({ error: 'week_start is required' }, { status: 400 })
    }

    const entries = getEntriesByWeek(weekStart)
    return NextResponse.json(entries)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.batch && Array.isArray(body.batch)) {
      const result = createEntriesBatch(body.batch)
      return NextResponse.json(result)
    }

    const entry = createEntry({
      activity_id: body.activity_id,
      week_start: body.week_start,
      day_of_week: body.day_of_week,
      time_slot: body.time_slot,
      sort_order: body.sort_order ?? 0,
    })

    if (!entry) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    if (body.reorder && Array.isArray(body.reorder)) {
      reorderEntries(body.reorder)
      return NextResponse.json({ success: true })
    }

    const entry = updateEntry(body.id, {
      day_of_week: body.day_of_week,
      time_slot: body.time_slot,
      sort_order: body.sort_order,
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    deleteEntry(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
