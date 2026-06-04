import crypto from 'crypto'
import { PLANS, type PlanId } from '@/lib/plans'

const MP_API_BASE = 'https://api.mercadopago.com'

export type MercadoPagoSubscriptionStatus =
  | 'pending'
  | 'authorized'
  | 'paused'
  | 'cancelled'
  | 'canceled'

export interface MercadoPagoPreapproval {
  id: string
  init_point?: string
  sandbox_init_point?: string
  status: MercadoPagoSubscriptionStatus
  reason?: string
  external_reference?: string
  payer_email?: string
  payer_id?: number
  auto_recurring?: {
    frequency?: number
    frequency_type?: string
    transaction_amount?: number
    currency_id?: string
    start_date?: string
    end_date?: string
  }
  next_payment_date?: string
  date_created?: string
  last_modified?: string
  summarized?: {
    charged_quantity?: number
    charged_amount?: number
    pending_charge_quantity?: number
    pending_charge_amount?: number
  }
}

export interface MercadoPagoAuthorizedPayment {
  id: number | string
  preapproval_id?: string
  status?: string
  status_detail?: string
  transaction_amount?: number
  currency_id?: string
  date_created?: string
  payment?: {
    id?: number | string
    status?: string
    status_detail?: string
    transaction_amount?: number
    currency_id?: string
  }
}

function accessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado')
  return token
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${MP_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': crypto.randomUUID(),
      ...(init?.headers ?? {}),
    },
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data?.message || data?.error || 'Erro Mercado Pago'
    throw new Error(`${message} (${res.status})`)
  }
  return data as T
}

export async function createMercadoPagoSubscription({
  userId,
  email,
  planId,
}: {
  userId: string
  email: string
  planId: Exclude<PlanId, 'free'>
}) {
  const plan = PLANS[planId]
  const externalReference = `lampas:${userId}:${planId}:${crypto.randomUUID()}`

  return mpFetch<MercadoPagoPreapproval>('/preapproval', {
    method: 'POST',
    body: JSON.stringify({
      reason: plan.mercadoPagoReason,
      external_reference: externalReference,
      payer_email: email,
      back_url: `${appUrl()}/billing/return`,
      notification_url: `${appUrl()}/api/billing/webhook`,
      status: 'pending',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: Number((plan.priceMonthly / 100).toFixed(2)),
        currency_id: 'BRL',
      },
    }),
  })
}

export async function getMercadoPagoSubscription(id: string) {
  return mpFetch<MercadoPagoPreapproval>(`/preapproval/${encodeURIComponent(id)}`)
}

export async function cancelMercadoPagoSubscription(id: string) {
  return mpFetch<MercadoPagoPreapproval>(`/preapproval/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'cancelled' }),
  })
}

export async function getMercadoPagoAuthorizedPayment(id: string) {
  return mpFetch<MercadoPagoAuthorizedPayment>(`/authorized_payments/${encodeURIComponent(id)}`)
}

export function verifyMercadoPagoWebhookSignature(req: Request) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
  if (!secret) throw new Error('MERCADO_PAGO_WEBHOOK_SECRET não configurado')

  const signature = req.headers.get('x-signature')
  const requestId = req.headers.get('x-request-id')
  if (!signature || !requestId) return false

  const url = new URL(req.url)
  const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? ''
  const parts = Object.fromEntries(
    signature.split(',').map(part => {
      const [key, value] = part.split('=')
      return [key?.trim(), value?.trim()]
    }).filter(([key, value]) => key && value),
  )

  const ts = parts.ts
  const hash = parts.v1
  if (!ts || !hash) return false

  const manifest = [
    dataId ? `id:${dataId};` : '',
    `request-id:${requestId};`,
    `ts:${ts};`,
  ].join('')

  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  if (expected.length !== hash.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash))
}
