import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { DEFAULT_ACTIVITIES } from '@/lib/default-activities'

export async function GET() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If no activities exist, seed defaults
  if (data.length === 0) {
    const { data: seeded, error: seedError } = await supabase
      .from('activities')
      .upsert(DEFAULT_ACTIVITIES, { onConflict: 'name,category', ignoreDuplicates: true })
      .select()

    if (seedError) {
      return NextResponse.json({ error: seedError.message }, { status: 500 })
    }
    return NextResponse.json(seeded)
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('activities')
    .insert({
      name: body.name,
      emoji: body.emoji,
      color: body.color,
      category: body.category,
      sort_order: body.sort_order ?? 99,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('activities')
    .update({
      name: body.name,
      emoji: body.emoji,
      color: body.color,
      category: body.category,
    })
    .eq('id', body.id)
    .select()
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

  // Delete related calendar entries first (cascade should handle this, but just in case)
  await supabase.from('calendar_entries').delete().eq('activity_id', id)

  const { error } = await supabase.from('activities').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
