import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const serviceClient = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  const projects = user
    ? (await supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })).data
    : (await serviceClient.from('projects').select('*').order('updated_at', { ascending: false })).data

  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const demoUser = user ?? { id: projects?.[0]?.user_id ?? '', email: 'demo@lampas.app' }

  return <DashboardClient user={demoUser as Parameters<typeof DashboardClient>[0]['user']} projects={projects || []} profile={profile} />
}
