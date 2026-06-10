import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('lampas_confessional_documents')
    .select('id, slug, kind, title, short_title, sort_order, metadata')
    .order('sort_order')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { q, doctrine, bible_ref, kind, limit = 30 } = await req.json() as {
    q?: string
    doctrine?: string
    bible_ref?: string
    kind?: string
    limit?: number
  }

  if (!q?.trim() && !doctrine?.trim() && !bible_ref?.trim()) {
    return Response.json({ error: 'Forneça ao menos um parâmetro de busca' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('search_confessional_items', {
    p_query: q?.trim() ?? null,
    p_doctrine: doctrine?.trim() ?? null,
    p_bible_ref: bible_ref?.trim() ?? null,
    p_kind: kind ?? null,
    p_limit: Math.min(limit, 100),
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}
