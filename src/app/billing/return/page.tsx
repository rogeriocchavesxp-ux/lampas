import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { syncMercadoPagoSubscriptionForUser } from '@/lib/billing-sync'

export default async function BillingReturnPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/billing/return')

  const sync = await syncMercadoPagoSubscriptionForUser(user.id).catch(() => null)
  const approved = sync?.plan && sync.plan !== 'free'

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--background)',
      padding: '2rem',
    }}>
      <section style={{
        width: '100%',
        maxWidth: 520,
        border: '1px solid var(--border-subtle)',
        borderRadius: 10,
        background: 'var(--surface)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{
          width: 44,
          height: 44,
          margin: '0 auto 1rem',
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          background: approved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
          color: approved ? 'var(--success)' : 'var(--warning)',
          fontWeight: 800,
        }}>
          {approved ? '✓' : '…'}
        </div>
        <h1 style={{ marginBottom: '0.7rem' }}>
          {approved ? 'Assinatura ativada' : 'Pagamento em processamento'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {approved
            ? 'Recebemos a confirmação do Mercado Pago e seu plano já foi liberado.'
            : 'Ainda não recebemos a confirmação final do Mercado Pago. Assim que o webhook confirmar o pagamento, seu plano será liberado automaticamente.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 8,
            padding: '0.65rem 1rem',
            fontWeight: 700,
          }}>
            Ir para o dashboard
          </Link>
          <Link href="/billing" style={{
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            borderRadius: 8,
            padding: '0.65rem 1rem',
            fontWeight: 600,
          }}>
            Ver planos
          </Link>
        </div>
      </section>
    </main>
  )
}
