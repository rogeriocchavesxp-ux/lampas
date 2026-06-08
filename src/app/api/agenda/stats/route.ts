import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null

  const { data, error } = await supabase.rpc('get_ministry_stats', {
    p_user_id: user.id,
    p_year: year,
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data)
}
