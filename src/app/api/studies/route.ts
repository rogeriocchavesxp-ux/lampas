import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const VALID_CATEGORIES = [
  'teologia-biblica',
  'teologia-sistematica',
  'filosofia',
  'historia',
  'geografia',
] as const

// ── GET — list studies for authenticated user ─────────────────────────────────

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  let query = supabase
    .from('lampas_studies')
    .select('id, category, title, subtitle, professor, tags, reading_time, is_published, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ── POST — publish a study (professor session or authenticated user) ───────────

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const {
    user_id,
    category,
    title,
    subtitle,
    content,
    professor,
    tags,
    reading_time,
    is_published = false,
    study_id,          // optional: update existing study
    service_key,       // professor sessions pass the service key
  } = body as {
    user_id?: string
    category: string
    title: string
    subtitle?: string
    content?: string
    professor?: string
    tags?: string[]
    reading_time?: number
    is_published?: boolean
    study_id?: string
    service_key?: string
  }

  // Validate category
  if (!VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return NextResponse.json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 })
  }

  if (!title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  let resolvedUserId: string

  // ── Auth path 1: service key (professor sessions) ─────────────────────────
  const expectedServiceKey = process.env.LAMPAS_SERVICE_KEY
  if (service_key && expectedServiceKey && service_key === expectedServiceKey) {
    if (!user_id) return NextResponse.json({ error: 'user_id required when using service_key' }, { status: 400 })
    resolvedUserId = user_id

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const row = {
      user_id: resolvedUserId,
      category,
      title: title.trim(),
      subtitle: subtitle?.trim() ?? null,
      content: content ?? null,
      professor: professor?.trim() ?? null,
      tags: tags ?? [],
      reading_time: reading_time ?? null,
      is_published,
    }

    if (study_id) {
      const { data, error } = await serviceClient
        .from('lampas_studies')
        .update(row)
        .eq('id', study_id)
        .eq('user_id', resolvedUserId)
        .select('id')
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ id: data.id, updated: true })
    }

    const { data, error } = await serviceClient
      .from('lampas_studies')
      .insert(row)
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id, created: true })
  }

  // ── Auth path 2: session cookie (authenticated user) ─────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  resolvedUserId = user.id

  const row = {
    user_id: resolvedUserId,
    category,
    title: title.trim(),
    subtitle: subtitle?.trim() ?? null,
    content: content ?? null,
    professor: professor?.trim() ?? null,
    tags: tags ?? [],
    reading_time: reading_time ?? null,
    is_published,
  }

  if (study_id) {
    const { data, error } = await supabase
      .from('lampas_studies')
      .update(row)
      .eq('id', study_id)
      .eq('user_id', resolvedUserId)
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id, updated: true })
  }

  const { data, error } = await supabase
    .from('lampas_studies')
    .insert(row)
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, created: true })
}

// ── DELETE — remove a study ───────────────────────────────────────────────────

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('lampas_studies')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
