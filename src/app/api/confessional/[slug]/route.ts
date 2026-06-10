import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { slug } = await params

  const { data: doc, error: docErr } = await supabase
    .from('lampas_confessional_documents')
    .select('id, slug, kind, title, short_title, sort_order, metadata')
    .eq('slug', slug)
    .single()

  if (docErr || !doc) return Response.json({ error: 'Documento não encontrado' }, { status: 404 })

  const [sectionsRes, questionsRes] = await Promise.all([
    supabase
      .from('lampas_confessional_sections')
      .select('id, number_label, title, content, summary, doctrine_tags, bible_references, dictionary_terms, sort_order')
      .eq('document_id', doc.id)
      .order('sort_order'),
    supabase
      .from('lampas_confessional_questions')
      .select('id, number, number_label, question, answer, explanation, doctrine_tags, bible_references, dictionary_terms, sort_order, metadata')
      .eq('document_id', doc.id)
      .order('sort_order'),
  ])

  return Response.json({
    ...doc,
    sections: sectionsRes.data ?? [],
    questions: questionsRes.data ?? [],
  })
}
