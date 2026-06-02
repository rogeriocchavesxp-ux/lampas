'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LampasLogo } from '@/components/LampasLogo'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const supabase = useMemo(() => createClient(), [])
  const router   = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', background: '#FFFFFF', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center' }}>
        <LampasLogo height={30} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Entrar no Lampas
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Exegese e homilética reformada com IA
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" required autoFocus
                  style={{ width: '100%', padding: '0.68rem 0.9rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Senha</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ width: '100%', padding: '0.68rem 0.9rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {error && (
                <p style={{ color: 'var(--error)', fontSize: '0.82rem', margin: 0 }}>{error}</p>
              )}

              <button
                type="submit" disabled={loading || !email || !password}
                style={{ width: '100%', padding: '0.72rem', background: loading || !email || !password ? 'var(--surface-2)' : 'var(--accent)', color: loading || !email || !password ? 'var(--text-muted)' : '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading || !email || !password ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
