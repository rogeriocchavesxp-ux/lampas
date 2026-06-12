import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import KnowledgeClient from './KnowledgeClient'

export default async function KnowledgePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: items }, { data: dashboard }] = await Promise.all([
    supabase
      .from('knowledge_items')
      .select('*')
      .or(`user_id.eq.${user.id},is_template.eq.true`)
      .order('updated_at', { ascending: false }),
    supabase
      .from('v_knowledge_dashboard')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  return (
    <KnowledgeClient
      userId={user.id}
      initialItems={items ?? []}
      initialDashboard={dashboard}
    />
  )
}
