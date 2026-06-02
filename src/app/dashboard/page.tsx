import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  let user = null
  let projects = null
  let profile = null

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser

    if (user) {
      const [{ data: p }, { data: pr }] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ])
      projects = p
      profile  = pr
    } else {
      const { data } = await supabase.from('projects').select('*').order('updated_at', { ascending: false })
      projects = data
    }
  } catch {
    // Supabase indisponível — renderiza estado vazio
  }

  const demoUser = user ?? { id: projects?.[0]?.user_id ?? '', email: 'demo@lampas.app' }

  return (
    <DashboardClient
      user={demoUser as Parameters<typeof DashboardClient>[0]['user']}
      projects={projects || []}
      profile={profile}
    />
  )
}
