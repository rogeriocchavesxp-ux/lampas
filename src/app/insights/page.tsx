import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InsightsClient from './InsightsClient'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .or('is_demo.is.null,is_demo.eq.false')
    .order('updated_at', { ascending: false })

  return <InsightsClient projects={projects || []} />
}
