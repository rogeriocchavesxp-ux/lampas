'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LampasLogo } from '@/components/LampasLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = useMemo(() => createClient(), [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface)',
    }}>
      {/* Top strip */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: '#FFFFFF',
        padding: '0 2rem',
        height: '56px',
        display: 'flex', alignItems: 'center',
      }}>
        <LampasLogo height={30} />
      </div>

      {/* Main */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
            }}>
              Entrar no Lampas
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Exegese e homilética reformada com IA
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.16)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '-0.015em' }}>
                  Verifique seu email
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Enviamos um link de acesso para{' '}
                  <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{email}</strong>
                </p>
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'var(--accent)', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: '500',
                    fontFamily: 'inherit', textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                  }}
                >
                  Usar outro email
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block', fontSize: '0.8rem',
                    color: 'var(--text-secondary)', marginBottom: '0.45rem',
                    fontWeight: '500',
                  }}>
                    Email
                  </label>
                  <form onSubmit={handleLogin}>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        fontFamily: 'inherit',
                        marginBottom: error ? '0.75rem' : '1rem',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--accent)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />

                    {error && (
                      <p style={{
                        color: 'var(--error)', fontSize: '0.82rem',
                        marginBottom: '0.75rem',
                      }}>
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !email}
                      style={{
                        width: '100%',
                        padding: '0.72rem',
                        background: loading || !email ? 'var(--surface-2)' : 'var(--accent)',
                        color: loading || !email ? 'var(--text-muted)' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: loading || !email ? 'not-allowed' : 'pointer',
                        transition: 'background 0.15s',
                        fontFamily: 'inherit',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {loading ? 'Enviando...' : 'Continuar com email'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          <p style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            marginTop: '1.5rem',
            lineHeight: '1.6',
          }}>
            Para pastores e seminaristas que levam a sério o texto bíblico.
          </p>
        </div>
      </div>
    </div>
  )
}
