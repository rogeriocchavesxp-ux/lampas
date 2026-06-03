import { createServiceClient } from '@/lib/supabase/service'
import { PLANS, type PlanId } from '@/lib/plans'
import { getMercadoPagoSubscription, type MercadoPagoPreapproval } from '@/lib/mercadopago'

export function parseMercadoPagoExternalReference(ref?: string | null) {
  const parts = ref?.split(':') ?? []
  if (parts.length < 4 || parts[0] !== 'lampas') return null
  const plan = parts[2] as PlanId
  if (!PLANS[plan] || plan === 'free') return null
  return { userId: parts[1], plan }
}

function isPaid(status?: string) {
  return status === 'authorized' || status === 'active'
}

function isClosed(status?: string) {
  return status === 'cancelled' || status === 'canceled' || status === 'paused'
}

export async function applyMercadoPagoSubscription(sub: MercadoPagoPreapproval) {
  const service = createServiceClient()
  const parsed = parseMercadoPagoExternalReference(sub.external_reference)
  const { data: existing } = await service
    .from('subscriptions')
    .select('id, user_id, plan, status, mercado_pago_init_point, started_at')
    .eq('mercado_pago_preapproval_id', sub.id)
    .maybeSingle()

  const userId = parsed?.userId ?? existing?.user_id
  if (!userId) throw new Error(`Assinatura Mercado Pago sem user_id: ${sub.id}`)

  const gatewayPlan = parsed?.plan ?? (existing?.plan as PlanId | undefined) ?? 'free'
  const activePlan = isPaid(sub.status) ? gatewayPlan : 'free'
  const amount = sub.auto_recurring?.transaction_amount
  const amountCents = typeof amount === 'number' ? Math.round(amount * 100) : PLANS[gatewayPlan]?.priceMonthly ?? 0
  const now = new Date().toISOString()

  const { data: saved, error } = await service
    .from('subscriptions')
    .upsert({
      user_id: userId,
      provider: 'mercado_pago',
      mercado_pago_preapproval_id: sub.id,
      mercado_pago_payer_id: sub.payer_id ? String(sub.payer_id) : null,
      mercado_pago_init_point: sub.init_point ?? sub.sandbox_init_point ?? existing?.mercado_pago_init_point ?? null,
      plan: activePlan,
      status: sub.status,
      amount_cents: amountCents,
      currency: sub.auto_recurring?.currency_id ?? 'BRL',
      billing_interval: 'monthly',
      started_at: sub.date_created ?? existing?.started_at ?? (isPaid(sub.status) ? now : null),
      current_period_end: sub.next_payment_date ?? null,
      next_payment_at: sub.next_payment_date ?? null,
      failure_reason: isClosed(sub.status) ? sub.status : null,
      gateway_raw: sub,
      updated_at: now,
    }, { onConflict: 'user_id' })
    .select('id')
    .single()

  if (error) throw error

  await service.from('profiles').update({ plan: activePlan, updated_at: now }).eq('id', userId)

  await service.from('billing_audit_logs').insert({
    user_id: userId,
    subscription_id: saved.id,
    provider: 'mercado_pago',
    event: `subscription_sync_${sub.status}`,
    plan_before: existing?.plan ?? 'free',
    plan_after: activePlan,
    status_before: existing?.status ?? null,
    status_after: sub.status,
    amount_cents: amountCents,
    transaction_id: sub.id,
    metadata: { external_reference: sub.external_reference },
  })

  return { subscriptionId: saved.id as string, userId, plan: activePlan, status: sub.status }
}

export async function syncMercadoPagoSubscriptionForUser(userId: string) {
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) return null

  const service = createServiceClient()
  const { data: sub } = await service
    .from('subscriptions')
    .select('provider, mercado_pago_preapproval_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (sub?.provider !== 'mercado_pago' || !sub.mercado_pago_preapproval_id) return null
  const mpSub = await getMercadoPagoSubscription(sub.mercado_pago_preapproval_id)
  return applyMercadoPagoSubscription(mpSub)
}
