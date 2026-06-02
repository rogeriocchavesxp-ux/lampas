'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLANS, formatPrice, type PlanId } from '@/lib/plans'
import type { UsageStatus } from '@/lib/billing'

interface Props {
  currentPlan: string
  status: string
  periodEnd: string | null
  cancelAtEnd: boolean
  usage: UsageStatus
  justUpgraded: boolean
}

const PLAN_ORDER: PlanId[] = ['free', 'iniciante', 'intermediario', 'avancado']

const GOLD   = 'var(--accent)'
const MUTED  = 'var(--text-muted)'
const BORDER = 'var(--border)'

export default function BillingClient({
  currentPlan, status, periodEnd, cancelAtEnd, usage, justUpgraded,
}: Props) {
  const router = useRouter()
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(planId: PlanId) {
    setLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('portal')
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  const usagePct = usage.limit === -1 ? 0 : Math.min(100, Math.round((usage.used / usage.limit) * 100))
  const usageColor = usagePct >= 90 ? 'var(--error)' : usagePct >= 70 ? 'var(--warning)' : GOLD

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* ── Topbar ── */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
        padding: '0 2rem',
        height: '46px',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '0.78rem', fontFamily: 'inherit' }}
        >← Dashboard</button>
        <span style={{ color: 'var(--border)', fontSize: '0.7rem' }}>·</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Planos</span>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>

        {/* ── Banner upgrade ── */}
        {justUpgraded && (
          <div style={{
            background: 'rgba(184,146,42,0.1)',
            border: `1px solid ${GOLD}`,
            borderRadius: '8px',
            padding: '0.85rem 1.2rem',
            marginBottom: '2rem',
            color: GOLD,
            fontSize: '0.9rem',
            fontWeight: 600,
          }}>
            Assinatura ativada com sucesso. Bem-vindo ao Lampas {PLANS[currentPlan as PlanId]?.name ?? ''}!
          </div>
        )}

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.68rem', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 900, marginBottom: '0.6rem' }}>
            Lampas
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.01em', marginBottom: '0.6rem' }}>
            Escolha seu plano
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
            Da leitura meditativa ao sermão impresso — tudo em um só lugar.
          </p>
        </div>

        {/* ── Uso atual ── */}
        <div style={{
          border: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
          borderRadius: '10px',
          padding: '1.2rem 1.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '0.68rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              Plano atual
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: GOLD }}>
                {PLANS[currentPlan as PlanId]?.name ?? 'Gratuito'}
              </span>
              {status === 'canceled' && (
                <span style={{ fontSize: '0.68rem', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
                  Cancelado
                </span>
              )}
              {cancelAtEnd && periodEnd && (
                <span style={{ fontSize: '0.68rem', color: 'var(--warning)' }}>
                  Ativo até {new Date(periodEnd).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>

          <div style={{ flex: 2, minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', color: MUTED }}>Consultas de IA este mês</span>
              <span style={{ fontSize: '0.72rem', color: usage.limit === -1 ? GOLD : 'var(--text-secondary)', fontWeight: 600 }}>
                {usage.limit === -1 ? 'Ilimitado' : `${usage.used} / ${usage.limit}`}
              </span>
            </div>
            {usage.limit !== -1 && (
              <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${usagePct}%`,
                  height: '100%',
                  background: usageColor,
                  borderRadius: '3px',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            )}
          </div>

          {currentPlan !== 'free' && (
            <button
              onClick={handlePortal}
              disabled={loading === 'portal'}
              style={{
                background: 'transparent',
                border: `1px solid ${BORDER}`,
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.78rem',
                padding: '0.45rem 0.9rem',
                whiteSpace: 'nowrap',
                opacity: loading === 'portal' ? 0.5 : 1,
              }}
            >
              {loading === 'portal' ? 'Abrindo...' : 'Gerenciar assinatura'}
            </button>
          )}
        </div>

        {/* ── Toggle mensal / anual ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            border: `1px solid ${BORDER}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {(['monthly', 'annual'] as const).map(iv => (
              <button
                key={iv}
                onClick={() => setInterval(iv)}
                style={{
                  background: interval === iv ? 'rgba(184,146,42,0.12)' : 'transparent',
                  border: 'none',
                  borderRight: iv === 'monthly' ? `1px solid ${BORDER}` : 'none',
                  color: interval === iv ? GOLD : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.82rem',
                  fontWeight: interval === iv ? 700 : 400,
                  padding: '0.5rem 1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {iv === 'monthly' ? 'Mensal' : 'Anual'}
                {iv === 'annual' && (
                  <span style={{
                    background: GOLD,
                    color: '#000',
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    padding: '0.1rem 0.35rem',
                    borderRadius: '3px',
                    letterSpacing: '0.04em',
                  }}>
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Cards de plano ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {PLAN_ORDER.map(planId => {
            const plan   = PLANS[planId]
            const isCurrent = planId === currentPlan
            const isPopular = plan.badge === 'Popular'
            const price  = interval === 'annual' ? plan.priceAnnual : plan.priceMonthly
            const monthlyEquiv = interval === 'annual' && plan.priceAnnual > 0
              ? Math.round(plan.priceAnnual / 12)
              : plan.priceMonthly

            return (
              <div
                key={planId}
                style={{
                  border: `1.5px solid ${isCurrent ? GOLD : isPopular ? 'rgba(184,146,42,0.35)' : BORDER}`,
                  background: isCurrent ? 'rgba(184,146,42,0.05)' : 'var(--surface)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                }}
              >
                {/* Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    {isPopular && !isCurrent && (
                      <div style={{
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        color: GOLD,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        marginBottom: '0.3rem',
                      }}>
                        Popular
                      </div>
                    )}
                    {isCurrent && (
                      <div style={{
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        color: GOLD,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        marginBottom: '0.3rem',
                      }}>
                        Plano atual
                      </div>
                    )}
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {plan.name}
                    </div>
                  </div>
                </div>

                {/* Preço */}
                <div>
                  {plan.priceMonthly === 0 ? (
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                      Grátis
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>R$</span>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                          {(monthlyEquiv / 100).toFixed(0)}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: MUTED }}>/mês</span>
                      </div>
                      {interval === 'annual' && (
                        <div style={{ fontSize: '0.72rem', color: MUTED, marginTop: '0.2rem' }}>
                          {formatPrice(price)} cobrado anualmente
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                      <span style={{ color: GOLD, fontSize: '0.65rem', flexShrink: 0 }}>✦</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {planId === 'free' ? (
                  isCurrent ? (
                    <div style={{ textAlign: 'center', fontSize: '0.78rem', color: MUTED, padding: '0.6rem 0' }}>
                      Plano atual
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', fontSize: '0.78rem', color: MUTED, padding: '0.6rem 0' }}>
                      Plano padrão
                    </div>
                  )
                ) : isCurrent ? (
                  <button
                    onClick={handlePortal}
                    disabled={loading === 'portal'}
                    style={{
                      background: 'rgba(184,146,42,0.1)',
                      border: `1px solid ${GOLD}`,
                      borderRadius: '7px',
                      color: GOLD,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      padding: '0.65rem',
                      width: '100%',
                    }}
                  >
                    Gerenciar
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(planId)}
                    disabled={!!loading}
                    style={{
                      background: isPopular ? GOLD : 'transparent',
                      border: `1px solid ${isPopular ? GOLD : BORDER}`,
                      borderRadius: '7px',
                      color: isPopular ? '#000' : 'var(--text-secondary)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      padding: '0.65rem',
                      width: '100%',
                      opacity: loading && loading !== planId ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!loading && !isPopular) {
                        e.currentTarget.style.borderColor = GOLD
                        e.currentTarget.style.color = GOLD
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isPopular) {
                        e.currentTarget.style.borderColor = BORDER
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }
                    }}
                  >
                    {loading === planId ? 'Aguarde...' : 'Assinar'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Rodapé ── */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.78rem', color: MUTED, lineHeight: 1.8 }}>
          Pagamento seguro via Stripe · Cancele a qualquer momento · Suporte em português
        </div>
      </div>
    </div>
  )
}
