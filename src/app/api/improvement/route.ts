import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface ItemInput {
  title: string
  problem?: string
  justification?: string
  suggestion?: string
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = new URL(req.url).searchParams.get('project_id')
  if (!projectId) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('improvement_items')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { project_id, section_slug, section_label, field_label, items } = body as {
    project_id: string
    section_slug?: string
    section_label?: string
    field_label?: string
    items: ItemInput[]
  }

  if (!project_id || !items?.length) {
    return NextResponse.json({ error: 'project_id and items required' }, { status: 400 })
  }

  const rows = items.map(item => ({
    project_id,
    user_id: user.id,
    section_slug:  section_slug  ?? null,
    section_label: section_label ?? null,
    field_label:   field_label   ?? null,
    title:         item.title,
    problem:       item.problem       ?? null,
    justification: item.justification ?? null,
    suggestion:    item.suggestion    ?? null,
  }))

  const { data, error } = await supabase
    .from('improvement_items')
    .insert(rows)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
