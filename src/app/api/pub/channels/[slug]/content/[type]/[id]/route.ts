import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

// GET /api/pub/channels/[slug]/content/[type]/[id]
// Retorna um item de conteúdo completo com metadados de publicação do canal.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; type: string; id: string }> },
) {
  const { slug, type, id } = await params
  const db = createServiceClient()

  // Resolve canal
  const { data: channel } = await db
    .from('editorial_channels')
    .select('id, slug, name, domain')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!channel) {
    return NextResponse.json({ error: 'Canal não encontrado.' }, { status: 404 })
  }

  // Busca publicação
  const { data: pub } = await db
    .from('editorial_publications')
    .select('*')
    .eq('channel_id', channel.id)
    .eq('content_type', type)
    .eq('content_id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (!pub) {
    return NextResponse.json({ error: 'Conteúdo não publicado neste canal.' }, { status: 404 })
  }

  // Busca conteúdo da tabela de origem
  let content: Record<string, unknown> | null = null

  if (type === 'boletim') {
    const { data } = await db
      .from('boletim_entries')
      .select('id, version, release_date, title, content, tags, slug, cover_image_url, seo_title, seo_description, og_image_url')
      .eq('id', id)
      .maybeSingle()
    content = data
  } else if (type === 'confessional_document') {
    const { data: doc } = await db
      .from('lampas_confessional_documents')
      .select('id, slug, title, kind, language, description, year_written')
      .eq('id', id)
      .maybeSingle()

    if (doc) {
      const { data: questions } = await db
        .from('lampas_confessional_questions')
        .select('number, number_label, question, answer, doctrine_tags, bible_references')
        .eq('document_id', id)
        .order('sort_order')
      content = { ...doc, questions: questions ?? [] }
    }
  } else if (type === 'knowledge_item') {
    const { data } = await db
      .from('knowledge_items')
      .select('id, title, subtitle, summary, category, item_type, content, tags')
      .eq('id', id)
      .maybeSingle()
    content = data
  }

  if (!content) {
    return NextResponse.json({ error: 'Conteúdo não encontrado.' }, { status: 404 })
  }

  const r = NextResponse.json({
    channel:     { slug: channel.slug, name: channel.name, domain: channel.domain },
    publication: {
      status:          pub.status,
      published_at:    pub.published_at,
      featured:        pub.featured,
      title_override:  pub.title_override,
      seo_title:       pub.seo_title,
      seo_description: pub.seo_description,
      og_image_url:    pub.og_image_url,
      canonical_url:   pub.canonical_url,
    },
    content,
  })
  r.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300')
  return r
}
