import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { PLANS, type PlanId } from '@/lib/plans'
import { createMercadoPagoSubscription } from '@/lib/mercadopago'

type CurrentSubscription = {
  id: string
  plan: string
  status: string
  provider: string | null
  mercado_pago_preapproval_id: string | null
  mercado_pago_init_point: string | null
  gateway_raw: Record<string, unknown> | null
}

function getRequestedPlan(sub: CurrentSubscription | null): PlanId | null {
  if (!sub) return null
  if (sub.plan !== 'free' && PLANS[sub.plan as PlanId]) return sub.plan as PlanId

  const requestedPlan = sub.gateway_raw?.requested_plan
  if (typeof requestedPlan === 'string' && PLANS[requestedPlan as PlanId]) {
    return requestedPlan as PlanId
  }

  const externalReference = sub.gateway_raw?.external_reference
  if (typeof externalReference === 'string') {
    const planId = externalReference.split(':')[2]
    if (PLANS[planId as PlanId]) return planId as PlanId
  }

  return null
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const service = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { planId } = await req.json() as { planId: PlanId; interval?: 'monthly' | 'annual' }
  const plan = PLANS[planId]
  if (!plan || planId === 'free') {
    return Response.json({ error: 'Plano inválido' }, { status: 400 })
  }

  const { data: current } = await service
    .from('subscriptions')
    .select('id, plan, status, provider, mercado_pago_preapproval_id, mercado_pago_init_point, gateway_raw')
    .eq('user_id', user.id)
    .maybeSingle() as { data: CurrentSubscription | null }

  const activeStatuses = ['authorized', 'active']
  if (current && current.plan === planId && activeStatuses.includes(String(current.status))) {
    return Response.json({ error: 'Este plano já está ativo para sua conta.' }, { status: 409 })
  }

  const requestedPlan = getRequestedPlan(current)
  if (
    current?.provider === 'mercado_pago' &&
    requestedPlan === planId &&
    current.status === 'pending' &&
    current.mercado_pago_init_point
  ) {
    return Response.json({ url: current.mercado_pago_init_point, reused: true })
  }

  const mpSub = await createMercadoPagoSubscription({
    userId: user.id,
    email: user.email,
    planId: planId as Exclude<PlanId, 'free'>,
  })

  const checkoutUrl = mpSub.init_point ?? mpSub.sandbox_init_point
  if (!checkoutUrl) {
    return Response.json({ error: 'Mercado Pago não retornou link de pagamento.' }, { status: 502 })
  }

  const now = new Date().toISOString()
  const amountCents = plan.priceMonthly

  const { data: saved, error } = await service
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      provider: 'mercado_pago',
      mercado_pago_preapproval_id: mpSub.id,
      mercado_pago_payer_id: mpSub.payer_id ? String(mpSub.payer_id) : null,
      mercado_pago_init_point: checkoutUrl,
      plan: 'free',
      status: 'pending',
      amount_cents: amountCents,
      currency: 'BRL',
      billing_interval: 'monthly',
      next_payment_at: mpSub.next_payment_date ?? null,
      gateway_raw: { ...mpSub, requested_plan: planId },
      updated_at: now,
    }, { onConflict: 'user_id' })
    .select('id')
    .single()

  if (error) {
    return Response.json({ error: 'Não foi possível registrar a assinatura.' }, { status: 500 })
  }

  await service.from('billing_audit_logs').insert({
    user_id: user.id,
    subscription_id: saved.id,
    provider: 'mercado_pago',
    event: 'checkout_created',
    plan_before: current?.plan ?? 'free',
    plan_after: planId,
    status_before: current?.status ?? null,
    status_after: 'pending',
    amount_cents: amountCents,
    transaction_id: mpSub.id,
    metadata: { mercado_pago_preapproval_id: mpSub.id },
  })

  return Response.json({ url: checkoutUrl, provider: 'mercado_pago' })
}
