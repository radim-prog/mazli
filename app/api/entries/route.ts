import { NextRequest, NextResponse } from 'next/server'
import { notion, ACTIVITIES_DS, ENTRIES_DS, isFullPage, pageToActivity, pageToEntry, entryProperties } from '@/lib/notion'

export async function GET(request: NextRequest) {
  try {
    const weekStart = request.nextUrl.searchParams.get('week_start')
    if (!weekStart) {
      return NextResponse.json({ error: 'week_start is required' }, { status: 400 })
    }

    // Fetch entries for this week
    const entriesResponse = await notion.dataSources.query({
      data_source_id: ENTRIES_DS,
      filter: {
        property: 'Week Start',
        date: { equals: weekStart },
      },
      sorts: [
        { property: 'Sort Order', direction: 'ascending' },
        { timestamp: 'created_time', direction: 'ascending' },
      ],
    })

    const entries = entriesResponse.results.filter(isFullPage).map(pageToEntry)

    if (entries.length === 0) {
      return NextResponse.json([])
    }

    // Fetch all activities for joining
    const activitiesResponse = await notion.dataSources.query({
      data_source_id: ACTIVITIES_DS,
      sorts: [{ property: 'Sort Order', direction: 'ascending' }],
    })
    const activities = activitiesResponse.results.filter(isFullPage).map(pageToActivity)
    const activityMap = new Map(activities.map(a => [a.id, a]))

    // Join entries with activities
    const result = entries
      .filter(e => activityMap.has(e.activity_id))
      .map(e => ({
        ...e,
        activity: activityMap.get(e.activity_id)!,
      }))

    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Batch insert for repeat functionality
    if (body.batch && Array.isArray(body.batch)) {
      const pages = await Promise.all(
        body.batch.map((item: { activity_id: string; week_start: string; day_of_week: number; time_slot: string }) =>
          notion.pages.create({
            parent: { data_source_id: ENTRIES_DS },
            properties: entryProperties({
              activity_id: item.activity_id,
              week_start: item.week_start,
              day_of_week: item.day_of_week,
              time_slot: item.time_slot,
              sort_order: 0,
            }),
          })
        )
      )

      // Fetch activities for joining
      const activitiesResponse = await notion.dataSources.query({
        data_source_id: ACTIVITIES_DS,
      })
      const activities = activitiesResponse.results.filter(isFullPage).map(pageToActivity)
      const activityMap = new Map(activities.map(a => [a.id, a]))

      const result = pages.filter(isFullPage).map(p => {
        const entry = pageToEntry(p)
        return {
          ...entry,
          activity: activityMap.get(entry.activity_id)!,
        }
      }).filter(e => e.activity)

      return NextResponse.json(result)
    }

    // Single insert
    const page = await notion.pages.create({
      parent: { data_source_id: ENTRIES_DS },
      properties: entryProperties({
        activity_id: body.activity_id,
        week_start: body.week_start,
        day_of_week: body.day_of_week,
        time_slot: body.time_slot,
        sort_order: body.sort_order ?? 0,
      }),
    })

    if (!isFullPage(page)) {
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
    }

    const entry = pageToEntry(page)
    const activityPage = await notion.pages.retrieve({ page_id: entry.activity_id })

    if (!isFullPage(activityPage)) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 500 })
    }

    return NextResponse.json({
      ...entry,
      activity: pageToActivity(activityPage),
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    // Batch reorder
    if (body.reorder && Array.isArray(body.reorder)) {
      await Promise.all(
        (body.reorder as { id: string; sort_order: number }[]).map(item =>
          notion.pages.update({
            page_id: item.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            properties: { 'Sort Order': { number: item.sort_order } } as any,
          })
        )
      )
      return NextResponse.json({ success: true })
    }

    // Single entry move
    const properties: Record<string, unknown> = {}
    if (body.day_of_week !== undefined) properties['Day of Week'] = { number: body.day_of_week }
    if (body.time_slot !== undefined) properties['Time Slot'] = { select: { name: body.time_slot } }
    if (body.sort_order !== undefined) properties['Sort Order'] = { number: body.sort_order }

    const page = await notion.pages.update({
      page_id: body.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: properties as any,
    })

    if (!isFullPage(page)) {
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
    }

    const entry = pageToEntry(page)
    const activityPage = await notion.pages.retrieve({ page_id: entry.activity_id })

    if (!isFullPage(activityPage)) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 500 })
    }

    return NextResponse.json({
      ...entry,
      activity: pageToActivity(activityPage),
    })
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

    await notion.pages.update({ page_id: id, archived: true })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
