import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkAIUsage } from '@/lib/billing'
import BillingClient from './BillingClient'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  const usage  = await checkAIUsage(user.id)
  const params = await searchParams
  const justUpgraded = params.upgraded === '1'

  return (
    <BillingClient
      currentPlan={sub?.plan ?? 'free'}
      status={sub?.status ?? 'active'}
      periodEnd={sub?.current_period_end ?? null}
      cancelAtEnd={sub?.cancel_at_period_end ?? false}
      usage={usage}
      justUpgraded={justUpgraded}
    />
  )
}
