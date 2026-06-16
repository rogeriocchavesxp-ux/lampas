import { createClient } from '@/lib/supabase/server'
import { STUDY_MODE_REGISTRY } from '@/lib/study-modes'

// Detalhe de um usuário para o Admin > Usuários (perfil + projetos + uso de IA).
// Acessível apenas para usuários com role = 'admin'.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return Response.json({ error: 'Acesso restrito' }, { status: 403 })
  }

  const month = new Date().toISOString().slice(0, 7)

  const [{ data: overview }, { data: projects }, { data: aiUsage }, { data: lastInteraction }] = await Promise.all([
    supabase.from('v_admin_users_overview').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('projects')
      .select('id, title, study_mode, status, book, passage_ref, created_at, updated_at')
      .eq('user_id', id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(50),
    supabase.from('ai_usage').select('count, month').eq('user_id', id).eq('month', month).maybeSingle(),
    supabase
      .from('ai_interactions')
      .select('section_slug, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!overview) {
    return Response.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const modeCount: Record<string, number> = {}
  for (const p of projects ?? []) {
    const mode = p.study_mode ?? 'sem_modo'
    modeCount[mode] = (modeCount[mode] ?? 0) + 1
  }

  const modesUsed = Object.entries(modeCount)
    .sort((a, b) => b[1] - a[1])
    .map(([mode, count]) => ({
      mode,
      label: STUDY_MODE_REGISTRY[mode as keyof typeof STUDY_MODE_REGISTRY]?.name ?? mode,
      count,
    }))

  return Response.json({
    profile: overview,
    projects: (projects ?? []).map(p => ({
      ...p,
      mode_label: STUDY_MODE_REGISTRY[p.study_mode as keyof typeof STUDY_MODE_REGISTRY]?.name ?? p.study_mode,
    })),
    modes_used: modesUsed,
    ai_usage_this_month: aiUsage?.count ?? 0,
    last_ai_interaction: lastInteraction ?? null,
  })
}
