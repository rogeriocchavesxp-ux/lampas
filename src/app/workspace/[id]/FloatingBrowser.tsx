'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const PILGRIM_URL = 'https://app.pilgrim.com.br/'
const MIN_W = 420
const MIN_H = 320
const DEFAULT_W = 840
const DEFAULT_H = 600

type WinState = 'normal' | 'minimized' | 'maximized'

interface Pos  { x: number; y: number }
interface Size { w: number; h: number }

interface FloatingBrowserProps {
  onClose: () => void
}

export default function FloatingBrowser({ onClose }: FloatingBrowserProps) {
  const [winState, setWinState] = useState<WinState>('normal')
  const [pos,      setPos]      = useState<Pos>({ x: 80, y: 60 })
  const [size,     setSize]     = useState<Size>({ w: DEFAULT_W, h: DEFAULT_H })
  const [iframeOk, setIframeOk] = useState<boolean | null>(null) // null = loading
  const [interacting, setInteracting] = useState(false)          // overlay to prevent iframe stealing events

  const savedPos  = useRef<Pos>(pos)
  const savedSize = useRef<Size>(size)

  // ── Drag ──────────────────────────────────────────────────────────────────

  function startDrag(e: React.MouseEvent) {
    if (winState !== 'normal') return
    e.preventDefault()
    setInteracting(true)
    const startX = e.clientX, startY = e.clientY
    const origX = pos.x, origY = pos.y

    function onMove(ev: MouseEvent) {
      setPos({
        x: Math.max(0, origX + ev.clientX - startX),
        y: Math.max(0, origY + ev.clientY - startY),
      })
    }
    function onUp() {
      setInteracting(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
  }

  // ── Resize ─────────────────────────────────────────────────────────────────

  type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

  function startResize(e: React.MouseEvent, handle: Handle) {
    if (winState !== 'normal') return
    e.preventDefault()
    e.stopPropagation()
    setInteracting(true)
    const startX = e.clientX, startY = e.clientY
    const origW = size.w, origH = size.h, origX = pos.x, origY = pos.y

    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      let w = origW, h = origH, x = origX, y = origY

      if (handle.includes('e')) w = Math.max(MIN_W, origW + dx)
      if (handle.includes('s')) h = Math.max(MIN_H, origH + dy)
      if (handle.includes('w')) { w = Math.max(MIN_W, origW - dx); x = origX + (origW - w) }
      if (handle.includes('n')) { h = Math.max(MIN_H, origH - dy); y = origY + (origH - h) }

      setSize({ w, h })
      setPos({ x: Math.max(0, x), y: Math.max(0, y) })
    }
    function onUp() {
      setInteracting(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
  }

  // ── Toggle maximize ────────────────────────────────────────────────────────

  function toggleMaximize() {
    if (winState === 'maximized') {
      setWinState('normal')
      setPos(savedPos.current)
      setSize(savedSize.current)
    } else {
      savedPos.current  = pos
      savedSize.current = size
      setWinState('maximized')
    }
  }

  // ── iframe load / error ────────────────────────────────────────────────────
  // X-Frame-Options blocks don't fire onerror — the frame just stays blank.
  // We use a 12s timeout after mount: if onLoad hasn't fired → assume blocked.

  useEffect(() => {
    const t = setTimeout(() => {
      if (iframeOk === null) setIframeOk(false)
    }, 12000)
    return () => clearTimeout(t)
  }, [iframeOk])

  // ── Computed styles ────────────────────────────────────────────────────────

  const isMaximized = winState === 'maximized'
  const isMinimized = winState === 'minimized'

  const containerStyle: React.CSSProperties = isMaximized
    ? { position: 'fixed', inset: 0, zIndex: 900 }
    : isMinimized
    ? { position: 'fixed', left: pos.x, top: pos.y, width: 280, zIndex: 900 }
    : { position: 'fixed', left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex: 900 }

  const RADIUS = isMaximized ? 0 : 10

  return (
    <div style={{
      ...containerStyle,
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)',
      border: isMaximized ? 'none' : '1px solid var(--border)',
      borderRadius: RADIUS,
      boxShadow: isMaximized ? 'none' : '0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)',
      overflow: 'hidden',
      userSelect: 'none',
    }}>

      {/* ── Title bar ── */}
      <div
        onMouseDown={startDrag}
        onDoubleClick={toggleMaximize}
        style={{
          height: 40, flexShrink: 0,
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center',
          padding: '0 0.6rem', gap: '0.5rem',
          cursor: winState === 'normal' ? 'grab' : 'default',
        }}
      >
        {/* macOS-style dots */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <WinDot color="#FF5F57" title="Fechar"    onClick={onClose} />
          <WinDot color="#FEBC2E" title="Minimizar" onClick={() => setWinState(s => s === 'minimized' ? 'normal' : 'minimized')} />
          <WinDot color="#28C840" title={isMaximized ? 'Restaurar' : 'Maximizar'} onClick={toggleMaximize} />
        </div>

        <div style={{ width: '1px', height: 16, background: 'var(--border-subtle)', flexShrink: 0 }} />

        {/* Favicon + label */}
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0 }}>🕊</span>
        <span style={{ fontSize: '0.77rem', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>Pilgrim</span>

        {/* URL bar */}
        <div style={{
          flex: 1, minWidth: 0,
          background: 'var(--surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 5, padding: '0.15rem 0.5rem',
          fontSize: '0.7rem', color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          cursor: 'default',
        }}>
          {PILGRIM_URL}
        </div>

        {/* Abrir em nova aba — sempre visível */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={() => window.open(PILGRIM_URL, '_blank', 'noopener')}
          title="Abrir Pilgrim em nova aba"
          style={{
            background: 'transparent', border: '1px solid var(--border-subtle)',
            borderRadius: 5, padding: '0.15rem 0.5rem',
            fontSize: '0.68rem', color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: 'inherit', flexShrink: 0, whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          ↗ Nova aba
        </button>
      </div>

      {/* ── Content (hidden when minimized) ── */}
      {!isMinimized && (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#fff' }}>

          {/* Loading state */}
          {iframeOk === null && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', gap: '0.75rem',
            }}>
              <LoadingSpinner />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carregando Pilgrim…</span>
            </div>
          )}

          {/* Blocked state */}
          {iframeOk === false && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', gap: '1rem', padding: '2rem', textAlign: 'center',
            }}>
              <span style={{ fontSize: '2rem' }}>🔒</span>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: 340, lineHeight: 1.5 }}>
                O Pilgrim não permite abertura incorporada por questões de segurança.
              </p>
              <button
                onClick={() => window.open(PILGRIM_URL, '_blank', 'noopener')}
                style={{
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '0.55rem 1.2rem',
                  fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
              >
                Abrir Pilgrim em nova aba ↗
              </button>
            </div>
          )}

          {/* Drag/resize overlay — prevents iframe from stealing mouse events */}
          {interacting && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 3, cursor: 'inherit' }} />
          )}

          {/* The iframe */}
          <iframe
            src={PILGRIM_URL}
            onLoad={() => setIframeOk(true)}
            onError={() => setIframeOk(false)}
            style={{
              width: '100%', height: '100%', border: 'none', display: 'block',
              opacity: iframeOk === true ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
            allow="clipboard-read; clipboard-write"
            title="Pilgrim"
          />
        </div>
      )}

      {/* ── Resize handles (normal state only) ── */}
      {winState === 'normal' && (
        <>
          {/* Edges */}
          <ResizeHandle handle="n"  style={{ top: 0,    left: 4,   right: 4,  height: 4,              cursor: 'n-resize'  }} onMouseDown={e => startResize(e, 'n')} />
          <ResizeHandle handle="s"  style={{ bottom: 0, left: 4,   right: 4,  height: 4,              cursor: 's-resize'  }} onMouseDown={e => startResize(e, 's')} />
          <ResizeHandle handle="e"  style={{ right: 0,  top: 4,    bottom: 4, width: 4,               cursor: 'e-resize'  }} onMouseDown={e => startResize(e, 'e')} />
          <ResizeHandle handle="w"  style={{ left: 0,   top: 4,    bottom: 4, width: 4,               cursor: 'w-resize'  }} onMouseDown={e => startResize(e, 'w')} />
          {/* Corners */}
          <ResizeHandle handle="nw" style={{ top: 0,    left: 0,   width: 8,  height: 8,              cursor: 'nw-resize' }} onMouseDown={e => startResize(e, 'nw')} />
          <ResizeHandle handle="ne" style={{ top: 0,    right: 0,  width: 8,  height: 8,              cursor: 'ne-resize' }} onMouseDown={e => startResize(e, 'ne')} />
          <ResizeHandle handle="sw" style={{ bottom: 0, left: 0,   width: 8,  height: 8,              cursor: 'sw-resize' }} onMouseDown={e => startResize(e, 'sw')} />
          <ResizeHandle handle="se" style={{ bottom: 0, right: 0,  width: 8,  height: 8,              cursor: 'se-resize' }} onMouseDown={e => startResize(e, 'se')} />
        </>
      )}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function WinDot({ color, title, onClick }: { color: string; title: string; onClick: () => void }) {
  return (
    <button
      onMouseDown={e => e.stopPropagation()}
      onClick={onClick}
      title={title}
      style={{
        width: 12, height: 12, borderRadius: '50%',
        background: color, border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
      }}
    />
  )
}

function ResizeHandle({ handle, style, onMouseDown }: {
  handle: string
  style: React.CSSProperties
  onMouseDown: (e: React.MouseEvent) => void
}) {
  return (
    <div
      data-resize={handle}
      onMouseDown={onMouseDown}
      style={{ position: 'absolute', zIndex: 10, ...style }}
    />
  )
}

function LoadingSpinner() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      border: '3px solid var(--border)',
      borderTopColor: 'var(--accent)',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}
