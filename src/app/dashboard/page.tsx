import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import type { Project, Profile } from '@/types/database'

async function getData(): Promise<{ user: User | null; projects: Project[]; profile: Profile | null }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const [{ data: projects }, { data: profile }] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ])
      return { user, projects: projects ?? [], profile }
    }

    // Sem sessão: tenta listar projetos via anon (RLS pode bloquear — retorna [])
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })

    return { user: null, projects: projects ?? [], profile: null }
  } catch {
    return { user: null, projects: [], profile: null }
  }
}

export default async function DashboardPage() {
  const { user, projects, profile } = await getData()

  const demoUser = user ?? { id: projects[0]?.user_id ?? '', email: 'demo@lampas.app' }

  return (
    <DashboardClient
      user={demoUser as Parameters<typeof DashboardClient>[0]['user']}
      projects={projects}
      profile={profile}
    />
  )
}
