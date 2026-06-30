import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return Response.json({ error: 'ID obrigatório' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('lib_entries')
    .select('id, heading, content, bible_ref')
    .eq('id', id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
