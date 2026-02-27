import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const weekStart = request.nextUrl.searchParams.get('week_start')

  if (!weekStart) {
    return NextResponse.json({ error: 'week_start is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('calendar_entries')
    .select('*, activity:activities(*)')
    .eq('week_start', weekStart)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  // Batch insert for repeat functionality
  if (body.batch && Array.isArray(body.batch)) {
    const rows = body.batch.map((item: { activity_id: string; week_start: string; day_of_week: number; time_slot: string }) => ({
      activity_id: item.activity_id,
      week_start: item.week_start,
      day_of_week: item.day_of_week,
      time_slot: item.time_slot,
      sort_order: 0,
    }))

    const { data, error } = await supabase
      .from('calendar_entries')
      .insert(rows)
      .select('*, activity:activities(*)')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }

  // Single insert
  const { data, error } = await supabase
    .from('calendar_entries')
    .insert({
      activity_id: body.activity_id,
      week_start: body.week_start,
      day_of_week: body.day_of_week,
      time_slot: body.time_slot,
      sort_order: body.sort_order ?? 0,
    })
    .select('*, activity:activities(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const body = await request.json()

  // Batch reorder: update sort_order for multiple entries
  if (body.reorder && Array.isArray(body.reorder)) {
    const updates = body.reorder as { id: string; sort_order: number }[]
    for (const item of updates) {
      await supabase
        .from('calendar_entries')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    }
    return NextResponse.json({ success: true })
  }

  // Single entry move
  const updateData: Record<string, unknown> = {}
  if (body.day_of_week !== undefined) updateData.day_of_week = body.day_of_week
  if (body.time_slot !== undefined) updateData.time_slot = body.time_slot
  if (body.sort_order !== undefined) updateData.sort_order = body.sort_order

  const { data, error } = await supabase
    .from('calendar_entries')
    .update(updateData)
    .eq('id', body.id)
    .select('*, activity:activities(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('calendar_entries')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
