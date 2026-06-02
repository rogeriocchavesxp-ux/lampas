import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  const stripe        = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) return new Response('Missing signature', { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return new Response('Webhook signature invalid', { status: 400 })
  }

  const supabase = createServiceClient()

  async function upsertSubscription(sub: Stripe.Subscription) {
    const userId = sub.metadata?.supabase_user_id
    const plan   = sub.metadata?.plan ?? 'free'
    if (!userId) return

    await supabase.from('subscriptions').upsert({
      user_id:                userId,
      stripe_customer_id:     sub.customer as string,
      stripe_subscription_id: sub.id,
      plan,
      status:                 sub.status,
      current_period_end:     sub.items.data[0]?.current_period_end
        ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end:   sub.cancel_at_period_end,
      updated_at:             new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await upsertSubscription(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (userId) {
        await supabase.from('subscriptions')
          .update({ plan: 'free', status: 'canceled', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
      }
      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await upsertSubscription(sub)
      }
      break
    }
  }

  return new Response('OK', { status: 200 })
}
