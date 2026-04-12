import { NextRequest, NextResponse } from 'next/server'
import { getAllActivities, createActivity, updateActivity, deleteActivity, seedDefaults } from '@/lib/db'
import { DEFAULT_ACTIVITIES } from '@/lib/default-activities'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let activities = getAllActivities()

    if (activities.length === 0) {
      activities = seedDefaults(DEFAULT_ACTIVITIES)
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
    const activity = createActivity({
      name: body.name,
      emoji: body.emoji,
      color: body.color,
      category: body.category,
      sort_order: body.sort_order ?? 99,
    })
    return NextResponse.json(activity)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const activity = updateActivity(body.id, {
      name: body.name,
      emoji: body.emoji,
      color: body.color,
      category: body.category,
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json(activity)
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

    deleteActivity(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
