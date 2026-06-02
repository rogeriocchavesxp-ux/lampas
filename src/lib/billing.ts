import { createClient } from '@/lib/supabase/server'
import { getPlan, type PlanId } from '@/lib/plans'

export interface UsageStatus {
  plan: PlanId
  used: number
  limit: number
  canUse: boolean
  remaining: number
}

export async function getUserPlan(userId: string): Promise<PlanId> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data || data.status === 'canceled' || data.status === 'past_due') {
    return 'free'
  }
  return (data.plan as PlanId) ?? 'free'
}

export async function checkAIUsage(userId: string): Promise<UsageStatus> {
  if (process.env.NODE_ENV === 'development') {
    return { plan: 'avancado', used: 0, limit: -1, canUse: true, remaining: -1 }
  }

  const supabase = await createClient()

  const planId = await getUserPlan(userId)
  const plan   = getPlan(planId)
  const limit  = plan.limits.aiPerMonth

  // Unlimited plan
  if (limit === -1) {
    return { plan: planId, used: 0, limit: -1, canUse: true, remaining: -1 }
  }

  const { data } = await supabase.rpc('get_ai_usage', { p_user_id: userId })
  const used = (data as number) ?? 0

  return {
    plan:      planId,
    used,
    limit,
    canUse:    used < limit,
    remaining: Math.max(0, limit - used),
  }
}

export async function incrementAIUsage(userId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc('increment_ai_usage', { p_user_id: userId })
}
