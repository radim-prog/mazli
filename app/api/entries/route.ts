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
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('calendar_entries')
    .insert({
      activity_id: body.activity_id,
      week_start: body.week_start,
      day_of_week: body.day_of_week,
      time_slot: body.time_slot,
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

  const { data, error } = await supabase
    .from('calendar_entries')
    .update({
      day_of_week: body.day_of_week,
      time_slot: body.time_slot,
    })
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
