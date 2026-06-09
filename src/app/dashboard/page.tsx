import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { syncMercadoPagoSubscriptionForUser } from '@/lib/billing-sync'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const uid = user!.id
  await syncMercadoPagoSubscriptionForUser(uid).catch(() => null)

  const [{ data: projects }, { data: profile }] = await Promise.all([
    supabase.from('projects').select('*').eq('user_id', uid).is('deleted_at', null).or('is_demo.is.null,is_demo.eq.false').order('updated_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', uid).single(),
  ])

  return (
    <Suspense fallback={null}>
      <DashboardClient
        user={user!}
        projects={projects || []}
        profile={profile}
      />
    </Suspense>
  )
}
