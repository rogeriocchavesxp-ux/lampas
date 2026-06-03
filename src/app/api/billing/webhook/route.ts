import { createServiceClient } from '@/lib/supabase/service'
import { applyMercadoPagoSubscription, parseMercadoPagoExternalReference } from '@/lib/billing-sync'
import {
  getMercadoPagoAuthorizedPayment,
  getMercadoPagoSubscription,
  verifyMercadoPagoWebhookSignature,
} from '@/lib/mercadopago'

export async function POST(req: Request) {
  let signatureValid = false
  try {
    signatureValid = verifyMercadoPagoWebhookSignature(req)
  } catch {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  if (!signatureValid) {
    return new Response('Webhook signature invalid', { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const service = createServiceClient()
  const url = new URL(req.url)

  const eventType = body.type ?? url.searchParams.get('type') ?? body.topic ?? 'unknown'
  const action = body.action ?? url.searchParams.get('action') ?? null
  const resourceId = body.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? body.id
  const eventId = body.id ? String(body.id) : `${eventType}:${resourceId}:${action ?? 'event'}`

  const { data: inserted, error: eventError } = await service
    .from('billing_webhook_events')
    .insert({
      provider: 'mercado_pago',
      event_id: eventId,
      event_type: eventType,
      resource_id: resourceId ? String(resourceId) : null,
      action,
      raw: body,
    })
    .select('id')
    .single()

  if (eventError?.code === '23505') {
    return new Response('Duplicate webhook ignored', { status: 200 })
  }
  if (eventError) {
    return new Response('Webhook event insert failed', { status: 500 })
  }

  try {
    if (!resourceId) throw new Error('Webhook sem resourceId')

    if (eventType === 'subscription_preapproval' || eventType === 'preapproval') {
      const sub = await getMercadoPagoSubscription(String(resourceId))
      await applyMercadoPagoSubscription(sub)
    }

    if (eventType === 'subscription_authorized_payment' || eventType === 'authorized_payment') {
      const payment = await getMercadoPagoAuthorizedPayment(String(resourceId))
      const preapprovalId = payment.preapproval_id
      if (!preapprovalId) throw new Error(`Pagamento autorizado sem preapproval_id: ${resourceId}`)

      const sub = await getMercadoPagoSubscription(preapprovalId)
      const { subscriptionId } = await applyMercadoPagoSubscription(sub)
      const parsed = parseMercadoPagoExternalReference(sub.external_reference)
      const userId = parsed?.userId
      const planId = parsed?.plan ?? 'free'
      const status = payment.payment?.status ?? payment.status ?? 'unknown'
      const amount = payment.payment?.transaction_amount ?? payment.transaction_amount ?? 0
      const amountCents = Math.round(amount * 100)
      const paymentId = payment.payment?.id ? String(payment.payment.id) : null

      await service.from('billing_payments').upsert({
        user_id: userId,
        subscription_id: subscriptionId,
        provider: 'mercado_pago',
        plan: planId,
        amount_cents: amountCents,
        currency: payment.payment?.currency_id ?? payment.currency_id ?? 'BRL',
        status,
        status_detail: payment.payment?.status_detail ?? payment.status_detail ?? null,
        mercado_pago_payment_id: paymentId,
        mercado_pago_authorized_payment_id: String(payment.id),
        mercado_pago_preapproval_id: preapprovalId,
        transaction_id: paymentId ?? String(payment.id),
        paid_at: status === 'approved' ? (payment.date_created ?? new Date().toISOString()) : null,
        raw: payment,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'mercado_pago_authorized_payment_id' })

      await service
        .from('subscriptions')
        .update({
          last_payment_id: paymentId,
          last_transaction_id: paymentId ?? String(payment.id),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
    }

    await service
      .from('billing_webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('id', inserted.id)

    return new Response('OK', { status: 200 })
  } catch (err) {
    await service
      .from('billing_webhook_events')
      .update({
        processed: false,
        processing_error: err instanceof Error ? err.message : 'Erro desconhecido',
        processed_at: new Date().toISOString(),
      })
      .eq('id', inserted.id)

    return new Response('Webhook processing failed', { status: 500 })
  }
}
