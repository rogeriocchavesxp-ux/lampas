import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sem user: busca projetos via anon key (RLS permite select público)
  // ou retorna vazio — o usuário pode navegar direto para o workspace pelo URL
  let projects = null
  try {
    const query = user
      ? supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
      : supabase.from('projects').select('*').order('updated_at', { ascending: false })
    const { data } = await query
    projects = data
  } catch { /* silent */ }

  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const demoUser = user ?? { id: projects?.[0]?.user_id ?? '', email: 'demo@lampas.app' }

  return <DashboardClient user={demoUser as Parameters<typeof DashboardClient>[0]['user']} projects={projects || []} profile={profile} />
}
