'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LampasLogo } from '@/components/LampasLogo'

function LoginContent() {
  const [mode,     setMode]     = useState<'login' | 'signup'>('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const router       = useRouter()
  const searchParams = useSearchParams()

  const next      = searchParams.get('next') ?? '/dashboard'
  const fromBilling = next.includes('billing')

  function switchMode(m: 'login' | 'signup') {
    setMode(m)
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email ou senha incorretos.')
        setLoading(false)
        return
      }
      router.push(next)
      router.refresh()
    } else {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) {
        setError(error.message.includes('already')
          ? 'Este email já está cadastrado. Faça login.'
          : error.message)
        setLoading(false)
        return
      }
      if (signUpData.session) {
        router.push(next)
        router.refresh()
        return
      }
      setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.68rem 0.9rem',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text-primary)',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)', background: '#FFFFFF',
        padding: '0 2rem', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <LampasLogo height={46} />
        <a href="/" style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
        >
          ← Voltar ao início
        </a>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Contexto quando vem da página de planos */}
          {fromBilling && (
            <div style={{
              background: 'rgba(201,146,26,0.06)', border: '1px solid rgba(201,146,26,0.2)',
              borderRadius: '8px', padding: '0.75rem 1rem',
              marginBottom: '1.5rem', textAlign: 'center',
              fontSize: '0.84rem', color: '#92650a',
            }}>
              Entre ou crie uma conta para assinar o plano.
            </div>
          )}

          {/* Título */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              {mode === 'login' ? 'Entrar no Lampas' : 'Criar conta'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Iluminando a sua jornada de estudo bíblico
            </p>
          </div>

          {/* Toggle login / cadastro */}
          <div style={{
            display: 'flex', background: 'var(--surface-2)', borderRadius: '8px',
            padding: '3px', marginBottom: '1.5rem',
          }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} type="button" onClick={() => switchMode(m)} style={{
                flex: 1, padding: '0.5rem', border: 'none', borderRadius: '6px', fontFamily: 'inherit',
                fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s',
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === m ? '0 1px 4px rgba(15,23,42,0.08)' : 'none',
              }}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {mode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Nome</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Seu nome" required autoFocus
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,77,140,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" required autoFocus={mode === 'login'}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,77,140,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Senha</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'} required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,77,140,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {error && <p style={{ color: 'var(--error)', fontSize: '0.82rem', margin: 0 }}>{error}</p>}
              {success && <p style={{ color: '#16a34a', fontSize: '0.82rem', margin: 0 }}>{success}</p>}

              <button
                type="submit"
                disabled={loading || !email || !password || (mode === 'signup' && !name)}
                style={{
                  width: '100%', padding: '0.72rem',
                  background: loading || !email || !password || (mode === 'signup' && !name)
                    ? 'var(--surface-2)' : 'var(--accent)',
                  color: loading || !email || !password || (mode === 'signup' && !name)
                    ? 'var(--text-muted)' : '#FFF',
                  border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                }}
              >
                {loading
                  ? (mode === 'login' ? 'Entrando…' : 'Criando conta…')
                  : (mode === 'login' ? 'Entrar' : 'Criar conta')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
