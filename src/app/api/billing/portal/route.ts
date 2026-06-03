import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { cancelMercadoPagoSubscription } from '@/lib/mercadopago'

export async function POST() {
  const supabase = await createClient()
  const service = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: sub } = await service
    .from('subscriptions')
    .select('id, plan, status, provider, mercado_pago_preapproval_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub?.mercado_pago_preapproval_id || sub.provider !== 'mercado_pago') {
    return Response.json({ error: 'Sem assinatura Mercado Pago ativa.' }, { status: 404 })
  }

  const previousPlan = sub.plan
  const previousStatus = sub.status
  const mpSub = await cancelMercadoPagoSubscription(sub.mercado_pago_preapproval_id)
  const now = new Date().toISOString()

  await service
    .from('subscriptions')
    .update({
      plan: 'free',
      status: mpSub.status ?? 'cancelled',
      cancel_at_period_end: false,
      failure_reason: 'cancelled_by_user',
      gateway_raw: mpSub,
      updated_at: now,
    })
    .eq('id', sub.id)

  await service.from('profiles').update({ plan: 'free', updated_at: now }).eq('id', user.id)

  await service.from('billing_audit_logs').insert({
    user_id: user.id,
    subscription_id: sub.id,
    provider: 'mercado_pago',
    event: 'subscription_cancel_requested',
    plan_before: previousPlan,
    plan_after: 'free',
    status_before: previousStatus,
    status_after: mpSub.status ?? 'cancelled',
    transaction_id: sub.mercado_pago_preapproval_id,
    metadata: { source: 'billing_portal_route' },
  })

  return Response.json({ canceled: true, status: mpSub.status ?? 'cancelled' })
}
