import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const projects = user ? (await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })).data : []

  const profile = user ? (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()).data : null

  const demoUser = user ?? { id: '', email: 'demo@lampas.app' }

  return <DashboardClient user={demoUser as Parameters<typeof DashboardClient>[0]['user']} projects={projects || []} profile={profile} />
}
