'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LampasLogo } from '@/components/LampasLogo'

type Step = 'credentials' | 'otp'
type Mode = 'login' | 'signup'

function LoginContent() {
  const [mode,     setMode]     = useState<Mode>('login')
  const [step,     setStep]     = useState<Step>('credentials')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [otpCode,  setOtpCode]  = useState('')
  const [otpType,  setOtpType]  = useState<'signup' | 'email'>('signup')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState('')

  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') ?? '/dashboard'
  const fromBilling  = next.includes('billing')
  const blocked      = searchParams.get('blocked') === '1'

  const [error, setError] = useState(blocked ? 'Sua conta foi bloqueada. Contate o suporte para mais informações.' : '')

  function switchMode(m: Mode) {
    setMode(m); setError(''); setSuccess(''); setStep('credentials')
  }

  // ── Step 1: email + senha ──────────────────────────────────────────────────

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        // Email não confirmado → pedir OTP de verificação
        if (error.message.toLowerCase().includes('email not confirmed') ||
            error.message.toLowerCase().includes('not confirmed')) {
          setOtpType('signup')
          // Reenviar código de confirmação
          await supabase.auth.resend({ type: 'signup', email })
          setStep('otp')
          setSuccess('Código de verificação reenviado para seu email.')
        } else {
          setError('Email ou senha incorretos.')
        }
        setLoading(false)
        return
      }
      router.push(next); router.refresh()
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      })
      if (error) {
        setError(
          error.message.toLowerCase().includes('already')
            ? 'Este email já está cadastrado. Faça login.'
            : error.message
        )
        setLoading(false)
        return
      }
      // Sessão imediata (confirmação desativada no Supabase)
      if (data.session) {
        router.push(next); router.refresh(); return
      }
      // Precisa verificar email → ir para passo OTP
      setOtpType('signup')
      setStep('otp')
      setSuccess('Código enviado para ' + email + '. Verifique sua caixa de entrada.')
      setLoading(false)
    }
  }

  // ── Step 2: verificar OTP ─────────────────────────────────────────────────

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode.trim(),
      type: otpType,
    })
    if (error) {
      setError('Código inválido ou expirado. Verifique e tente novamente.')
      setLoading(false)
      return
    }
    router.push(next); router.refresh()
  }

  async function resendCode() {
    setError(''); setSuccess('')
    const supabase = createClient()
    await supabase.auth.resend({ type: 'signup', email })
    setSuccess('Novo código enviado para ' + email)
  }

  // ── Estilos ────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.68rem 0.9rem',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text-primary)',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
  }

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = 'var(--accent)'
      e.target.style.boxShadow = '0 0 0 3px rgba(30,77,140,0.1)'
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = 'var(--border)'
      e.target.style.boxShadow = 'none'
    },
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>

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

          {fromBilling && (
            <div style={{
              background: 'rgba(201,146,26,0.06)', border: '1px solid rgba(201,146,26,0.2)',
              borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
              textAlign: 'center', fontSize: '0.84rem', color: '#92650a',
            }}>
              Entre ou crie uma conta para assinar o plano.
            </div>
          )}

          {/* ── Passo 1: Credenciais ── */}
          {step === 'credentials' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {mode === 'login' ? 'Entrar no Lampas' : 'Criar conta'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Iluminando a sua jornada de estudo bíblico
                </p>
              </div>

              <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: '8px', padding: '3px', marginBottom: '1.5rem' }}>
                {(['login', 'signup'] as const).map(m => (
                  <button key={m} type="button" onClick={() => switchMode(m)} style={{
                    flex: 1, padding: '0.5rem', border: 'none', borderRadius: '6px',
                    fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.13s',
                    background: mode === m ? '#fff' : 'transparent',
                    color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: mode === m ? '0 1px 4px rgba(15,23,42,0.08)' : 'none',
                  }}>
                    {m === 'login' ? 'Entrar' : 'Criar conta'}
                  </button>
                ))}
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
                <form onSubmit={handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {mode === 'signup' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Nome</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Seu nome" required autoFocus style={inputStyle} {...focusHandlers} />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com" required autoFocus={mode === 'login'}
                      style={inputStyle} {...focusHandlers} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>Senha</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'} required
                      style={inputStyle} {...focusHandlers} />
                  </div>

                  {error   && <p style={{ color: 'var(--error)', fontSize: '0.82rem', margin: 0 }}>{error}</p>}
                  {success && <p style={{ color: '#16a34a',      fontSize: '0.82rem', margin: 0 }}>{success}</p>}

                  <button type="submit"
                    disabled={loading || !email || !password || (mode === 'signup' && !name)}
                    style={{
                      width: '100%', padding: '0.72rem', border: 'none',
                      borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600,
                      cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
                      transition: 'background 0.15s',
                      background: (loading || !email || !password || (mode === 'signup' && !name))
                        ? 'var(--surface-2)' : 'var(--accent)',
                      color: (loading || !email || !password || (mode === 'signup' && !name))
                        ? 'var(--text-muted)' : '#FFF',
                    }}
                  >
                    {loading
                      ? (mode === 'login' ? 'Entrando…' : 'Criando conta…')
                      : (mode === 'login' ? 'Entrar' : 'Criar conta')}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ── Passo 2: Código OTP ── */}
          {step === 'otp' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📬</div>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Verificar email
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Digite o código de 6 dígitos enviado para<br />
                  <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
                <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
                      Código de verificação
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      required
                      autoFocus
                      style={{
                        ...inputStyle,
                        fontSize: '1.6rem', letterSpacing: '0.4em',
                        textAlign: 'center', fontWeight: 700,
                      }}
                      {...focusHandlers}
                    />
                  </div>

                  {error   && <p style={{ color: 'var(--error)', fontSize: '0.82rem', margin: 0 }}>{error}</p>}
                  {success && <p style={{ color: '#16a34a',      fontSize: '0.82rem', margin: 0 }}>{success}</p>}

                  <button type="submit"
                    disabled={loading || otpCode.length < 6}
                    style={{
                      width: '100%', padding: '0.72rem', border: 'none',
                      borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600,
                      cursor: (loading || otpCode.length < 6) ? 'default' : 'pointer',
                      fontFamily: 'inherit', transition: 'background 0.15s',
                      background: (loading || otpCode.length < 6) ? 'var(--surface-2)' : 'var(--accent)',
                      color:      (loading || otpCode.length < 6) ? 'var(--text-muted)' : '#FFF',
                    }}
                  >
                    {loading ? 'Verificando…' : 'Confirmar e entrar'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <button type="button" onClick={() => { setStep('credentials'); setOtpCode(''); setError(''); setSuccess('') }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'inherit', padding: 0 }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      ← Voltar
                    </button>
                    <button type="button" onClick={resendCode}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent)', fontFamily: 'inherit', padding: 0, fontWeight: 600 }}
                    >
                      Reenviar código
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

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
