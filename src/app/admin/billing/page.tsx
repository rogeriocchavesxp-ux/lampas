import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/plans'

type AdminSubscription = {
  id: string
  user_id: string
  email: string | null
  full_name: string | null
  provider: string | null
  plan: string
  status: string
  amount_cents: number | null
  currency: string | null
  billing_interval: string | null
  started_at: string | null
  current_period_end: string | null
  next_payment_at: string | null
  last_payment_id: string | null
  last_transaction_id: string | null
  mercado_pago_preapproval_id: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string
}

type Payment = {
  id: string
  user_id: string | null
  plan: string
  amount_cents: number
  currency: string
  status: string
  status_detail: string | null
  mercado_pago_payment_id: string | null
  mercado_pago_authorized_payment_id: string | null
  mercado_pago_preapproval_id: string | null
  paid_at: string | null
  created_at: string
}

function dateLabel(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function statusTone(status: string) {
  if (['authorized', 'active', 'approved'].includes(status)) return '#15803D'
  if (['pending', 'in_process'].includes(status)) return '#B45309'
  if (['cancelled', 'canceled', 'rejected', 'paused'].includes(status)) return '#B91C1C'
  return 'var(--text-muted)'
}

export default async function AdminBillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin/billing')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ data: subscriptions }, { data: payments }] = await Promise.all([
    supabase
      .from('v_admin_billing_subscriptions')
      .select('*')
      .order('updated_at', { ascending: false })
      .returns<AdminSubscription[]>(),
    supabase
      .from('billing_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .returns<Payment[]>(),
  ])

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>← Dashboard</Link>
            <h1 style={{ marginTop: '0.5rem' }}>Assinaturas</h1>
            <p style={{ color: 'var(--text-muted)' }}>Gestão financeira e auditoria Mercado Pago.</p>
          </div>
          <Link href="/billing" style={{
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '0.6rem 0.9rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}>
            Ver planos
          </Link>
        </div>

        <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
            Assinaturas atuais
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', background: 'var(--surface)' }}>
                  {['Usuário', 'Plano', 'Status', 'Valor', 'Início', 'Renovação', 'Transação'].map(h => (
                    <th key={h} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(subscriptions ?? []).map(sub => (
                  <tr key={sub.id}>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <strong>{sub.full_name || sub.email || sub.user_id}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{sub.email}</div>
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>{sub.plan}</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)', color: statusTone(sub.status), fontWeight: 700 }}>
                      {sub.status}
                      {sub.failure_reason && <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{sub.failure_reason}</div>}
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      {formatPrice(sub.amount_cents ?? 0)}
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{sub.billing_interval ?? 'monthly'}</div>
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>{dateLabel(sub.started_at)}</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>{dateLabel(sub.next_payment_at ?? sub.current_period_end)}</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                      {sub.last_transaction_id ?? sub.mercado_pago_preapproval_id ?? '—'}
                    </td>
                  </tr>
                ))}
                {(subscriptions ?? []).length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '1rem', color: 'var(--text-muted)' }}>Nenhuma assinatura registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
            Histórico de pagamentos
          </div>
          <div style={{ display: 'grid' }}>
            {(payments ?? []).map(payment => (
              <div key={payment.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '1rem',
                padding: '0.85rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                alignItems: 'center',
              }}>
                <div>
                  <strong>{payment.plan}</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                    MP: {payment.mercado_pago_payment_id ?? payment.mercado_pago_authorized_payment_id ?? payment.mercado_pago_preapproval_id ?? '—'}
                  </div>
                </div>
                <span style={{ color: statusTone(payment.status), fontWeight: 700 }}>{payment.status}</span>
                <span>{formatPrice(payment.amount_cents)}</span>
              </div>
            ))}
            {(payments ?? []).length === 0 && (
              <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Nenhum pagamento registrado.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
