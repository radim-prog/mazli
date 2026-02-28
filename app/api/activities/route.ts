import { NextRequest, NextResponse } from 'next/server'
import { notion, ACTIVITIES_DS, ENTRIES_DS, isFullPage, pageToActivity, activityProperties } from '@/lib/notion'
import { DEFAULT_ACTIVITIES } from '@/lib/default-activities'

export async function GET() {
  try {
    const response = await notion.dataSources.query({
      data_source_id: ACTIVITIES_DS,
      sorts: [{ property: 'Sort Order', direction: 'ascending' }],
    })
    const activities = response.results.filter(isFullPage).map(pageToActivity)

    // Seed defaults if empty
    if (activities.length === 0) {
      const created = await Promise.all(
        DEFAULT_ACTIVITIES.map(a =>
          notion.pages.create({
            parent: { data_source_id: ACTIVITIES_DS },
            properties: activityProperties(a),
          })
        )
      )
      return NextResponse.json(created.filter(isFullPage).map(pageToActivity))
    }

    return NextResponse.json(activities)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const page = await notion.pages.create({
      parent: { data_source_id: ACTIVITIES_DS },
      properties: activityProperties({
        name: body.name,
        emoji: body.emoji,
        color: body.color,
        category: body.category,
        sort_order: body.sort_order ?? 99,
      }),
    })

    if (!isFullPage(page)) {
      return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
    }

    return NextResponse.json(pageToActivity(page))
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const props = {
      'Name': { title: [{ text: { content: body.name } }] },
      'Emoji': { rich_text: [{ text: { content: body.emoji } }] },
      'Color': { rich_text: [{ text: { content: body.color } }] },
      'Category': { select: { name: body.category } },
    }
    const page = await notion.pages.update({
      page_id: body.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: props as any,
    })

    if (!isFullPage(page)) {
      return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
    }

    return NextResponse.json(pageToActivity(page))
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

    // Archive related calendar entries first
    const entries = await notion.dataSources.query({
      data_source_id: ENTRIES_DS,
      filter: {
        property: 'Activity',
        relation: { contains: id },
      },
    })

    await Promise.all(
      entries.results.map(e =>
        notion.pages.update({ page_id: e.id, archived: true })
      )
    )

    // Archive the activity
    await notion.pages.update({ page_id: id, archived: true })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
