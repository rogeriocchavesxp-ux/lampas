'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const PILGRIM_URL  = 'https://app.pilgrim.com.br/'
const POPUP_OPTS   = 'width=1200,height=820,left=80,top=60,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no'
const POLL_INTERVAL = 1000 // ms para checar se o popup ainda está aberto

interface FloatingBrowserProps {
  onClose: () => void
}

type PanelState = 'idle' | 'open' | 'closed_by_user'

export default function FloatingBrowser({ onClose }: FloatingBrowserProps) {
  const [panelState, setPanelState] = useState<PanelState>('idle')
  const popupRef = useRef<Window | null>(null)
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  // Monitora se o popup foi fechado pelo usuário
  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        setPanelState('closed_by_user')
        popupRef.current = null
        if (pollRef.current) clearInterval(pollRef.current)
      }
    }, POLL_INTERVAL)
  }, [])

  // Limpa o interval ao desmontar
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  function openPopup() {
    // Foca se já existe
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus()
      return
    }
    const popup = window.open(PILGRIM_URL, 'lampas_pilgrim', POPUP_OPTS)
    if (!popup) {
      // Popup bloqueado pelo browser
      setPanelState('idle')
      return
    }
    popupRef.current = popup
    setPanelState('open')
    startPolling()
  }

  function focusPopup() {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus()
    }
  }

  function closePopup() {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close()
    }
    popupRef.current = null
    setPanelState('idle')
    if (pollRef.current) clearInterval(pollRef.current)
  }

  return (
    <div style={{
      position: 'fixed',
      right: 24, bottom: 80,   // acima da bottom nav
      width: 320,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 3px 10px rgba(0,0,0,0.08)',
      zIndex: 900,
      overflow: 'hidden',
      userSelect: 'none',
    }}>

      {/* ── Cabeçalho ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.7rem 0.85rem',
        background: 'var(--surface-2)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <span style={{ fontSize: '1rem' }}>🕊</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>Pilgrim</span>
        <StatusDot state={panelState} />
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1, padding: '2px 4px',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          title="Fechar painel"
        >
          ✕
        </button>
      </div>

      {/* ── Corpo ── */}
      <div style={{ padding: '1.1rem 1rem' }}>

        {panelState === 'idle' && (
          <>
            <p style={{
              fontSize: '0.78rem', color: 'var(--text-secondary)',
              margin: '0 0 1rem 0', lineHeight: 1.6,
            }}>
              O Pilgrim abre em uma janela separada do browser onde o login e os cookies funcionam normalmente.
            </p>
            <p style={{
              fontSize: '0.72rem', color: 'var(--text-muted)',
              margin: '0 0 1rem 0', lineHeight: 1.5,
            }}>
              ℹ️ Iframes bloqueiam cookies de terceiros — por isso o login não funciona incorporado.
            </p>
            <PrimaryBtn onClick={openPopup}>
              Abrir Pilgrim em janela popup
            </PrimaryBtn>
            <SecondaryBtn onClick={() => window.open(PILGRIM_URL, '_blank', 'noopener')}>
              Abrir em nova aba ↗
            </SecondaryBtn>
          </>
        )}

        {panelState === 'open' && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 8, padding: '0.6rem 0.75rem', marginBottom: '1rem',
            }}>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', lineHeight: 1.5 }}>
                Pilgrim está aberto em popup separado. Faça login normalmente.
              </span>
            </div>
            <PrimaryBtn onClick={focusPopup}>
              Focar janela do Pilgrim
            </PrimaryBtn>
            <SecondaryBtn onClick={closePopup}>
              Fechar popup
            </SecondaryBtn>
          </>
        )}

        {panelState === 'closed_by_user' && (
          <>
            <p style={{
              fontSize: '0.78rem', color: 'var(--text-secondary)',
              margin: '0 0 1rem 0', lineHeight: 1.6,
            }}>
              A janela do Pilgrim foi fechada.
            </p>
            <PrimaryBtn onClick={openPopup}>
              Reabrir Pilgrim
            </PrimaryBtn>
            <SecondaryBtn onClick={() => { setPanelState('idle') }}>
              Cancelar
            </SecondaryBtn>
          </>
        )}
      </div>

      {/* ── Rodapé ── */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '0.5rem 1rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          app.pilgrim.com.br
        </span>
        <button
          onClick={() => window.open(PILGRIM_URL, '_blank', 'noopener')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'inherit', padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ↗ nova aba
        </button>
      </div>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function StatusDot({ state }: { state: PanelState }) {
  const color = state === 'open' ? '#22c55e' : state === 'closed_by_user' ? '#f59e0b' : 'var(--border)'
  const title = state === 'open' ? 'Popup aberto' : state === 'closed_by_user' ? 'Popup fechado' : 'Inativo'
  return (
    <span title={title} style={{
      width: 8, height: 8, borderRadius: '50%', background: color,
      display: 'inline-block', flexShrink: 0,
    }} />
  )
}

function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '0.55rem', marginBottom: '0.45rem',
        background: 'var(--accent)', color: '#fff', border: 'none',
        borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
        fontFamily: 'inherit', cursor: 'pointer', transition: 'background 0.13s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
    >
      {children}
    </button>
  )
}

function SecondaryBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '0.48rem',
        background: 'transparent', color: 'var(--text-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8, fontSize: '0.8rem', fontWeight: 500,
        fontFamily: 'inherit', cursor: 'pointer', transition: 'border-color 0.13s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      {children}
    </button>
  )
}
