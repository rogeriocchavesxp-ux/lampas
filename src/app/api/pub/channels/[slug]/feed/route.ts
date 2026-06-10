import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

// GET /api/pub/channels/[slug]/feed
// Retorna conteúdo publicado de um canal. Usado por portais externos.
// Cache: 5 minutos (portais usam ISR por cima disso)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)

  const page         = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit        = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const contentType  = searchParams.get('content_type') ?? null
  const featuredOnly = searchParams.get('featured_only') === 'true'
  const offset       = (page - 1) * limit

  const db = createServiceClient()

  // Resolve channel_id pelo slug
  const { data: channel, error: chErr } = await db
    .from('editorial_channels')
    .select('id, slug, name, domain')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (chErr || !channel) {
    return NextResponse.json({ error: 'Canal não encontrado.' }, { status: 404 })
  }

  // Busca publicações
  let query = db
    .from('editorial_publications')
    .select('id, content_type, content_id, status, published_at, featured, slug_override, title_override, summary_override, seo_title, seo_description, og_image_url, canonical_url, sort_weight', { count: 'exact' })
    .eq('channel_id', channel.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (contentType) query = query.eq('content_type', contentType)
  if (featuredOnly) query = query.eq('featured', true)

  const { data: publications, count, error: pubErr } = await query

  if (pubErr) {
    return NextResponse.json({ error: pubErr.message }, { status: 500 })
  }

  // Enriquece cada publicação com o conteúdo da tabela de origem
  const items = await Promise.all(
    (publications ?? []).map(async pub => {
      let content: Record<string, unknown> | null = null

      if (pub.content_type === 'boletim') {
        const { data } = await db
          .from('boletim_entries')
          .select('id, version, release_date, title, content, tags, slug, cover_image_url')
          .eq('id', pub.content_id)
          .maybeSingle()
        content = data
      } else if (pub.content_type === 'confessional_document') {
        const { data } = await db
          .from('lampas_confessional_documents')
          .select('id, slug, title, kind, language')
          .eq('id', pub.content_id)
          .maybeSingle()
        content = data
      } else if (pub.content_type === 'knowledge_item') {
        const { data } = await db
          .from('knowledge_items')
          .select('id, title, subtitle, summary, category, item_type')
          .eq('id', pub.content_id)
          .maybeSingle()
        content = data
      }

      return { ...pub, content }
    })
  )

  const response = NextResponse.json({
    channel: { slug: channel.slug, name: channel.name, domain: channel.domain },
    items,
    total:    count ?? 0,
    page,
    limit,
    has_next: offset + limit < (count ?? 0),
  })

  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
  return response
}
