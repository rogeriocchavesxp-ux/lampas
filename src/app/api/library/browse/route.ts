import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest } from 'next/server'

const LIMIT = 25

export async function GET(req: NextRequest) {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { searchParams } = req.nextUrl
  const work_id    = searchParams.get('work_id')
  const bible_book = searchParams.get('bible_book') || null
  const q          = searchParams.get('q') || null
  const page       = Math.max(0, parseInt(searchParams.get('page') ?? '0'))
  const offset     = page * LIMIT

  // Full-text search across all works
  if (q && !work_id) {
    const { data, error } = await supabase.rpc('lib_search', {
      p_query:         q,
      p_work_type:     null,
      p_tradition:     null,
      p_bible_book:    bible_book,
      p_bible_chapter: null,
      p_limit:         LIMIT,
    })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ entries: data ?? [], hasMore: false, total: null })
  }

  if (!work_id) return Response.json({ entries: [], hasMore: false, total: 0 })

  // Get volumes for this work
  const { data: volumes, error: volError } = await supabase
    .from('lib_volumes')
    .select('id')
    .eq('work_id', work_id)

  if (volError) {
    console.error('[library/browse] volumes query error:', volError)
    return Response.json({ error: volError.message }, { status: 500 })
  }

  const volumeIds = (volumes ?? []).map((v: { id: string }) => v.id)
  if (volumeIds.length === 0) return Response.json({ entries: [], hasMore: false, total: 0 })

  // Count total (for progress indicator)
  let countQuery = supabase
    .from('lib_entries')
    .select('id', { count: 'exact', head: true })
    .in('volume_id', volumeIds)
  if (bible_book) countQuery = countQuery.eq('bible_book', bible_book)
  const { count } = await countQuery

  // Fetch entries (content truncated to 600 chars for list view)
  let query = supabase
    .from('lib_entries')
    .select('id, heading, content, bible_book, bible_chapter, bible_ref')
    .in('volume_id', volumeIds)
    .order('sequence')
    .range(offset, offset + LIMIT)

  if (bible_book) query = query.eq('bible_book', bible_book)
  if (q) query = query.ilike('heading', `%${q}%`)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const EXCERPT = 600
  const hasMore = (data?.length ?? 0) > LIMIT
  const entries = (data ?? []).slice(0, LIMIT).map((e: {
    id: string; heading: string | null; content: string | null;
    bible_book: string | null; bible_chapter: number | null; bible_ref: string | null
  }) => ({
    id:          e.id,
    heading:     e.heading,
    content_excerpt: e.content ? e.content.slice(0, EXCERPT) : null,
    has_more_content: (e.content?.length ?? 0) > EXCERPT,
    bible_book:  e.bible_book,
    bible_chapter: e.bible_chapter,
    bible_ref:   e.bible_ref,
  }))

  return Response.json({ entries, hasMore, total: count ?? 0 })
}
