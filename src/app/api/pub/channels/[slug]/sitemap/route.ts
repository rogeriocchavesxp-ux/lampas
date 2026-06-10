import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

// GET /api/pub/channels/[slug]/sitemap
// Retorna lista de slugs publicados para geração de sitemap.xml pelo portal.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const db = createServiceClient()

  const { data: channel } = await db
    .from('editorial_channels')
    .select('id, domain')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!channel) {
    return NextResponse.json({ error: 'Canal não encontrado.' }, { status: 404 })
  }

  const { data: publications } = await db
    .from('editorial_publications')
    .select('content_type, content_id, slug_override, published_at, updated_at')
    .eq('channel_id', channel.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (!publications?.length) {
    const r = NextResponse.json([])
    r.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300')
    return r
  }

  // Resolve slug por tipo de conteúdo
  const items = await Promise.all(
    publications.map(async pub => {
      let contentSlug: string | null = pub.slug_override ?? null

      if (!contentSlug) {
        if (pub.content_type === 'boletim') {
          const { data } = await db
            .from('boletim_entries')
            .select('slug')
            .eq('id', pub.content_id)
            .maybeSingle()
          contentSlug = data?.slug ?? null
        } else if (pub.content_type === 'confessional_document') {
          const { data } = await db
            .from('lampas_confessional_documents')
            .select('slug')
            .eq('id', pub.content_id)
            .maybeSingle()
          contentSlug = data?.slug ?? null
        } else if (pub.content_type === 'knowledge_item') {
          const { data } = await db
            .from('knowledge_items')
            .select('id')
            .eq('id', pub.content_id)
            .maybeSingle()
          contentSlug = data?.id ?? null
        }
      }

      if (!contentSlug) return null
      return {
        slug:         contentSlug,
        content_type: pub.content_type,
        content_id:   pub.content_id,
        updated_at:   pub.updated_at ?? pub.published_at,
      }
    })
  )

  const r = NextResponse.json(items.filter(Boolean))
  r.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300')
  return r
}
