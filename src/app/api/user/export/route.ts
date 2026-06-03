import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const [
    { data: profile },
    { data: projects },
    { data: sections },
    { data: usage },
    { data: interactions },
    { data: dictionary },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('projects').select('*').eq('user_id', user.id),
    supabase.from('sections').select('*').eq('user_id', user.id),
    supabase.from('ai_usage').select('*').eq('user_id', user.id),
    supabase.from('ai_interactions').select('created_at, section_slug, mode, input_tokens, output_tokens').eq('user_id', user.id).order('created_at', { ascending: false }).limit(500),
    supabase.from('lampas_dictionary').select('*').eq('created_by', user.id),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email, created_at: user.created_at },
    profile,
    projects: projects ?? [],
    sections: sections ?? [],
    ai_usage: usage ?? [],
    ai_interactions: interactions ?? [],
    dictionary: dictionary ?? [],
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="lampas-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
