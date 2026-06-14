import { createClient } from '@/lib/supabase/server'

// GET /api/book-introductions?testament=AT            → lista resumida
// GET /api/book-introductions?book_key=João           → intro completa de um livro
// GET /api/book-introductions?testament=AT&summary=1  → lista com summary incluído

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const testament = searchParams.get('testament')
  const bookKey   = searchParams.get('book_key')
  const withSummary = searchParams.get('summary') === '1'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  if (bookKey) {
    const { data, error } = await supabase
      .from('book_introductions')
      .select('*')
      .eq('book_key', bookKey)
      .single()

    if (error?.code === 'PGRST116') return Response.json(null)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  }

  if (testament) {
    const cols = withSummary
      ? 'id,book_key,book_name,canonical_order,literary_category,author,date_estimate,central_theme,summary'
      : 'id,book_key,book_name,canonical_order,literary_category,author,date_estimate,central_theme'

    const { data, error } = await supabase
      .from('book_introductions')
      .select(cols)
      .eq('testament', testament)
      .order('canonical_order', { ascending: true })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data ?? [])
  }

  return Response.json({ error: 'Parâmetro testament ou book_key obrigatório' }, { status: 400 })
}
