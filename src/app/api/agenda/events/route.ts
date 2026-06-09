import { createClient } from '@/lib/supabase/server'
import type { CreateAgendaEvent } from '@/types/agenda'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from       = searchParams.get('from')
  const to         = searchParams.get('to')
  const type       = searchParams.get('type')
  const status     = searchParams.get('status')
  const projectId  = searchParams.get('project_id')
  const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit      = Math.min(200, parseInt(searchParams.get('limit') ?? '50'))
  const offset     = (page - 1) * limit

  let query = supabase
    .from('agenda_events')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('starts_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (from)      query = query.gte('starts_at', from)
  if (to)        query = query.lte('starts_at', to)
  if (type)      query = query.eq('event_type', type)
  if (status)    query = query.eq('status', status)
  if (projectId) query = query.eq('project_id', projectId)

  const { data, error, count } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ data: data ?? [], total: count ?? 0, page })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  let body: CreateAgendaEvent
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { title, event_type, starts_at, ends_at } = body
  if (!title || !event_type || !starts_at || !ends_at) {
    return Response.json({ error: 'Campos obrigatórios: title, event_type, starts_at, ends_at' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('agenda_events')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ data }, { status: 201 })
}
