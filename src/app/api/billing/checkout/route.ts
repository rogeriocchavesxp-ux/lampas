import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { PLANS, type PlanId } from '@/lib/plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { planId, interval } = await req.json() as { planId: PlanId; interval: 'monthly' | 'annual' }
  const plan = PLANS[planId]
  if (!plan || planId === 'free') {
    return Response.json({ error: 'Plano inválido' }, { status: 400 })
  }

  const priceId = interval === 'annual' ? plan.stripePriceAnnual : plan.stripePriceMonthly
  if (!priceId) {
    return Response.json({ error: 'Plano não configurado' }, { status: 400 })
  }

  // Get or create Stripe customer
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  let customerId = sub?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=1`,
    cancel_url:  `${appUrl}/billing`,
    metadata: { supabase_user_id: user.id, plan: planId },
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan: planId },
    },
    allow_promotion_codes: true,
  })

  return Response.json({ url: session.url })
}
